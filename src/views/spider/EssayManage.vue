<template>
    <div class="search">
        <Row>
            <Col>
                <Card>
                    <Row @keydown.enter.native="handleSearch">
                        <Form
                                ref="searchForm"
                                :model="searchForm"
                                inline
                                :label-width="40"
                                class="search-form"
                        >
                            <Form-item label="Key" prop="key">
                                <Input
                                        type="text"
                                        v-model="searchForm.key"
                                        placeholder="请输入Key"
                                        clearable
                                        style="width: 200px"
                                />
                            </Form-item>
                            <Form-item style="margin-left:-35px;" class="br">
                                <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
                                <Button @click="handleReset">重置</Button>
                            </Form-item>
                        </Form>
                    </Row>
                    <Row class="operation">
                        <Button @click="add" type="primary" icon="md-add">添加</Button>
                        <Button @click="getDataList" icon="md-refresh">刷新</Button>
                        <circleLoading v-if="operationLoading"/>
                    </Row>
                    <Row>
                        <Alert show-icon>
                            已选择
                            <span class="select-count">{{selectCount}}</span> 项
                            <a class="select-clear" @click="clearSelectAll">清空</a>
                        </Alert>
                    </Row>
                    <Row>
                        <Table
                                :loading="loading"
                                border
                                :columns="columns"
                                :data="data"
                                ref="table"
                                sortable="custom"
                                @on-sort-change="changeSort"
                                @on-selection-change="changeSelect"
                        ></Table>
                    </Row>
                    <Row type="flex" justify="end" class="page">
                        <Page
                                :current="pageNumber"
                                :total="total"
                                :page-size="pageSize"
                                @on-change="changePage"
                                @on-page-size-change="changePageSize"
                                :page-size-opts="[10,20,50]"
                                size="small"
                                show-total
                                show-elevator
                                show-sizer
                        ></Page>
                    </Row>

                </Card>
            </Col>
        </Row>
        <Modal :title="modalTitle" v-model="modalVisible" :mask-closable="false" :width="500">
            <Form ref="form" :model="form" :label-width="70" :rules="formValidate">
                <FormItem label="类别" prop="key">
                    <Input v-model="form.category" style="width:100%"/>
                </FormItem>
                <FormItem label="内容" prop="value">
                    <Input v-model="form.content" type="textarea" :rows="5" style="width:100%"/>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="modalVisible=false">取消</Button>
                <Button type="primary" :loading="submitLoading" @click="handleSubmit">提交</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import {
        getEssayData,
        saveEssay
    } from "@/api/index";
    import Cookies from "js-cookie";
    import circleLoading from "@/views/my-components/circle-loading.vue";

    export default {
        name: "redis-notCache",
        components: {
            circleLoading
        },
        data() {
            return {
                loading: true, // 表单加载状态
                operationLoading: false, // 操作加载状态
                modalType: 0, // 添加或编辑标识
                modalVisible: false, // 添加或编辑显示
                modalTitle: "", // 添加或编辑标题
                searchForm: {
                    // 搜索框初始化对象
                    pageNumber: 1, // 当前页数
                    pageSize: 10, // 页面大小
                    sort: "createTime", // 默认排序字段
                    order: "desc" // 默认排序方式
                },
                form: {
                    // 添加或编辑表单对象初始化数据
                    category: "",
                    content: "",
                    uid: "",
                },
                // 表单验证规则
                formValidate: {
                    category: [{required: false, message: "不能为空", trigger: "blur"}],
                    content: [{required: true, message: "不能为空", trigger: "blur"}]
                },
                submitLoading: false, // 添加或编辑提交状态
                selectList: [], // 多选数据
                selectCount: 0, // 多选计数
                columns: [
                    // 表头
                    {
                        type: "selection",
                        width: 60,
                        align: "center"
                    },
                    {
                        type: "index",
                        width: 60,
                        align: "center"
                    },
                    {
                        title: "类目",
                        key: "category",
                        width: 80,
                        sortable: true
                    },
                    {
                        title: "内容",
                        key: "content",
                        minWidth: 300,
                        ellipsis: true
                    }

                ],
                data: [], // 表单数据
                pageNumber: 1, // 当前页数
                pageSize: 10, // 页面大小
                total: 0 // 表单数据总数
            };
        },
        methods: {
            init() {
                this.getDataList();
                let userInfo = JSON.parse(Cookies.get("userInfo"));
                this.form.uid = userInfo.id;
            },
            changePage(v) {
                this.searchForm.pageNumber = v;
                this.getDataList();
                this.clearSelectAll();
            },
            changePageSize(v) {
                this.searchForm.pageSize = v;
                this.getDataList();
            },
            handleSearch() {
                this.searchForm.pageNumber = 1;
                this.searchForm.pageSize = 10;
                this.getDataList();
            },
            handleReset() {
                this.$refs.searchForm.resetFields();
                this.searchForm.pageNumber = 1;
                this.searchForm.pageSize = 10;
                // 重新加载数据
                this.getDataList();
            },
            changeSort(e) {
                this.searchForm.sort = e.key;
                this.searchForm.order = e.order;
                if (e.order === "normal") {
                    this.searchForm.order = "";
                }
                this.getDataList();
            },
            clearSelectAll() {
                this.$refs.table.selectAll(false);
            },
            changeSelect(e) {
                this.selectList = e;
                this.selectCount = e.length;
            },
            getDataList() {
                this.loading = true;
                getEssayData(this.searchForm).then(res => {
                    this.loading = false;
                    if (res.success) {
                        this.data = res.result.rows;
                        this.total = res.result.total;
                    }
                });
            },
            handleSubmit() {
                this.$refs.form.validate(valid => {
                    if (valid) {
                        this.submitLoading = true;
                        // 添加或编辑
                        saveEssay(this.form).then(res => {
                            this.submitLoading = false;
                            if (res.success) {
                                this.$Message.success("操作成功");
                                this.getDataList();
                                this.modalVisible = false;
                            }
                        });
                    }
                });
            },
            add() {
                this.modalType = 0;
                this.modalTitle = "添加";
                this.form.content = "";
                this.$refs.form.resetFields();
                delete this.form.id;
                this.modalVisible = true;
            }

        },
        mounted() {
            this.init();
        }
    };
</script>
<style lang="less">
    .search {
        .operation {
            margin-bottom: 2vh;
        }

        .select-count {
            font-size: 13px;
            font-weight: 600;
            color: #40a9ff;
        }

        .select-clear {
            margin-left: 10px;
        }

        .page {
            margin-top: 2vh;
        }

        .drop-down {
            font-size: 13px;
            margin-left: 5px;
        }
    }

    textarea.ivu-input {
        max-width: 100%;
        height: auto;
        min-height: 32px;
        vertical-align: bottom;
        font-size: 12px;
    }
</style>
