<style lang="less">
    @import "./home.less";
    @import "../../styles/common.less";
</style>

<template>
    <div>


        <Card>
            <Row class-name="made-child-con-middle" type="flex" align="middle">
                <div>
                    <b class="card-user-infor-name">{{ username }}</b>
                    <p> 欢迎您的使用 Spider</p>
                </div>
            </Row>

        </Card>


    </div>
</template>

<script>
    import Cookies from "js-cookie";

    export default {
        name: "home",
        components: {},
        data() {
            return {
                username: ""
            };
        },
        computed: {
            currNav() {
                return this.$store.state.app.currNav;
            },
            avatarPath() {
                return localStorage.avatorImgPath;
            }
        },
        methods: {
            init() {
                let userInfo = JSON.parse(Cookies.get("userInfo"));
                this.username = userInfo.username;

            }
        },
        mounted() {
            this.init();

        }
    };
</script>
