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
                <FormItem label="应用平台" prop="value">
                    <Input v-model="form.applicationType" readonly  style="width:100%"/>
                </FormItem>
                <FormItem label="应用名称" prop="key">
                    <Input v-model="form.appName" style="width:100%"/>
                </FormItem>
                <FormItem label="版本" prop="value">
                    <Input v-model="form.version" style="width:100%"/>
                </FormItem>
                <FormItem label="强制更新" prop="status">
                    <i-switch size="large" v-model="form.constraints" :true-value="0" :false-value="-1">
                        <span slot="open">是</span>
                        <span slot="close">否</span>
                    </i-switch>
                </FormItem>
                <FormItem label="更新日志" prop="value">
                    <Input v-model="form.updateLog" type="textarea" :rows="5" style="width:100%"/>
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
        getVersionData,saveVersion, editVersion,enableVersion, disableVersion,deleteVersion
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
                uid: "",
                searchForm: {
                    // 搜索框初始化对象
                    pageNumber: 1, // 当前页数
                    pageSize: 10, // 页面大小
                    sort: "createTime", // 默认排序字段
                    order: "desc" // 默认排序方式
                },
                form: {
                    // 添加或编辑表单对象初始化数据
                    applicationType: "android",
                    appName: "spider",
                    version: "",
                    constraints: 0,
                    updateLog: "",
                    createBy: "",
                    updateBy: ""
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
                        title: "平台",
                        key: "applicationType",
                        width: 80

                    },
                    {
                        title: "app名称",
                        key: "appName",
                        width: 150
                    },
                    {
                        title: "版本",
                        key: "version",
                        width: 100,
                        ellipsis: true
                    },
                    {
                        title: "强制更新",
                        key: "constraints",
                        width: 100,
                        ellipsis: true,
                        render: (h, params) => {
                                return h("div", [
                                    "是"
                                ]);
                        }
                    },
                    {
                        title: "停用状态",
                        key: "state",
                        width: 100,
                        ellipsis: true,
                        render: (h, params) => {
                            if (params.row.state === 0) {
                                return h("div", [
                                    h("Badge", {
                                        props: {
                                            status: "success",
                                            text: "正常启用"
                                        }
                                    })
                                ]);
                            } else if (params.row.state === -1) {
                                return h("div", [
                                    h("Badge", {
                                        props: {
                                            status: "error",
                                            text: "禁用"
                                        }
                                    })
                                ]);
                            }
                        },
                        filters: [
                            {
                                label: "正常启用",
                                value: 0
                            },
                            {
                                label: "禁用",
                                value: -1
                            }
                        ],
                        filterMultiple: false,
                        filterMethod(value, row) {
                            if (value === 0) {
                                return row.state == 0;
                            } else if (value === -1) {
                                return row.state == -1;
                            }
                        }
                    },
                    {
                        title: "更新日志",
                        key: "updateLog",
                        minWidth: 300,
                        ellipsis: true
                    },
                    {
                        title: "操作",
                        key: "action",
                        width: 200,
                        align: "center",
                        fixed: "right",
                        render: (h, params) => {
                            let enableOrDisable = "";
                            if (params.row.state === 0) {
                                enableOrDisable = h(
                                    "Button",
                                    {
                                        props: {
                                            size: "small"
                                        },
                                        style: {
                                            marginRight: "5px"
                                        },
                                        on: {
                                            click: () => {
                                                this.disable(params.row);
                                            }
                                        }
                                    },
                                    "禁用"
                                );
                            } else {
                                enableOrDisable = h(
                                    "Button",
                                    {
                                        props: {
                                            type: "success",
                                            size: "small"
                                        },
                                        style: {
                                            marginRight: "5px"
                                        },
                                        on: {
                                            click: () => {
                                                this.enable(params.row);
                                            }
                                        }
                                    },
                                    "启用"
                                );
                            }
                            return h("div", [
                                h(
                                    "Button",
                                    {
                                        props: {
                                            type: "primary",
                                            size: "small"
                                        },
                                        style: {
                                            marginRight: "5px"
                                        },
                                        on: {
                                            click: () => {
                                                this.edit(params.row);
                                            }
                                        }
                                    },
                                    "编辑"
                                ),
                                enableOrDisable,
                                h(
                                    "Button",
                                    {
                                        props: {
                                            type: "error",
                                            size: "small"
                                        },
                                        on: {
                                            click: () => {
                                                this.remove(params.row);
                                            }
                                        }
                                    },
                                    "删除"
                                )
                            ]);
                        }
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
                this.uid = userInfo.id;
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
                getVersionData(this.searchForm).then(res => {
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
                        if (this.modalType === 0) {
                            this.submitLoading = true;
                            // 添加或编辑
                            saveVersion(this.form).then(res => {
                                this.submitLoading = false;
                                if (res.success) {
                                    this.$Message.success("操作成功");
                                    this.getDataList();
                                    this.modalVisible = false;
                                }
                            });
                        } else if(this.modalType === 1) {
                            editVersion(this.form).then(res => {
                                this.submitLoading = false;
                                if (res.success) {
                                    this.$Message.success("操作成功");
                                    this.getDataList();
                                    this.modalVisible = false;
                                }
                            })
                        }
                    }
                });
            },
            add() {
                this.modalType = 0;
                this.modalTitle = "添加";
                this.form.content = "";
                this.$refs.form.resetFields();
                this.form.createBy = this.uid;
                delete this.form.id;
                this.modalVisible = true;
            },
            edit(v) {
                this.modalType = 1;
                this.modalTitle = "编辑";
                this.$refs.form.resetFields();
                // 转换null为""
                for (let attr in v) {
                    if (v[attr] == null) {
                        v[attr] = "";
                    }
                }
                let str = JSON.stringify(v);
                let data = JSON.parse(str);
                this.form = data;
                this.form.updateBy = this.uid;
                this.modalVisible = true;
            },
            enable(v) {
                this.$Modal.confirm({
                    title: "确认启用",
                    content: "您确认要启用这个版本吗 " + v.version + " ?",
                    loading: true,
                    onOk: () => {
                        enableVersion(v.id).then(res => {
                            this.$Modal.remove();
                            if (res.success) {
                                this.$Message.success("操作成功");
                                this.getDataList();
                            }
                        });
                    }
                });
            },
            disable(v) {
                this.$Modal.confirm({
                    title: "确认禁用",
                    content: "您确认要禁用这个版本吗 " + v.version + " ?",
                    loading: true,
                    onOk: () => {
                        disableVersion(v.id).then(res => {
                            this.$Modal.remove();
                            if (res.success) {
                                this.$Message.success("操作成功");
                                this.getDataList();
                            }
                        });
                    }
                });
            },
            remove(v) {
                this.$Modal.confirm({
                    title: "确认删除",
                    content: "您确认要删除这个版本吗 " + v.version + " ?",
                    loading: true,
                    onOk: () => {
                        deleteVersion(v.id).then(res => {
                            this.$Modal.remove();
                            if (res.success) {
                                this.$Message.success("删除成功");
                                this.getDataList();
                            }
                        });
                    }
                });
            },

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
