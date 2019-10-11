<template>
  <div class="login">
    <Row type="flex" justify="center" align="middle" @keydown.enter.native="submitLogin">
      <Col style="width: 368px;">
        <Header />
        <Row>
          <Tabs v-model="tabName">
            <TabPane :label="$t('usernameLogin')" name="username" icon="md-person">
              <Form
                ref="usernameLoginForm"
                :model="form"
                :rules="rules"
                class="form"
                v-if="tabName==='username'"
              >
                <FormItem prop="username">
                  <Input
                    v-model="form.username"
                    prefix="ios-contact"
                    size="large"
                    clearable
                    placeholder="请输入用户名"
                    autocomplete="off"
                  />
                </FormItem>
                <FormItem prop="password">
                  <Input
                    type="password"
                    v-model="form.password"
                    prefix="ios-lock"
                    size="large"
                    clearable
                    placeholder="请输入密码"
                    autocomplete="off"
                  />
                </FormItem>
                <FormItem prop="imgCode">
                  <Row
                    type="flex"
                    justify="space-between"
                    style="align-items: center;overflow: hidden;"
                  >
                    <Input
                      v-model="form.imgCode"
                      size="large"
                      clearable
                      placeholder="请输入图片验证码"
                      :maxlength="10"
                      class="input-verify"
                    />
                    <div style="position:relative">
                      <Spin v-if="loadingCaptcha" fix></Spin>
                      <img
                        :src="captchaImg"
                        @click="getCaptchaImg"
                        alt="加载验证码失败"
                        style="width:100px;cursor:pointer;display:block"
                      />
                    </div>
                  </Row>
                </FormItem>
              </Form>
            </TabPane>
          </Tabs>

          <Row type="flex" justify="space-between">
            <Checkbox v-model="saveLogin" size="large">{{ $t('autoLogin') }}</Checkbox>
          </Row>
          <Row>
            <Button
              class="login-btn"
              type="primary"
              size="large"
              :loading="loading"
              @click="submitLogin"
              long
            >
              <span v-if="!loading">{{ $t('login') }}</span>
              <span v-else>{{ $t('logining') }}</span>
            </Button>
          </Row>
        </Row>
        <Footer />
      </Col>
      <LangSwitch />
    </Row>
  </div>
</template>

<script>
import { login, userInfo, initCaptcha, drawCodeImage } from "@/api/index";
import { validateMobile } from "@/libs/validate";
import Cookies from "js-cookie";
import Header from "@/views/main-components/header";
import Footer from "@/views/main-components/footer";
import LangSwitch from "@/views/main-components/lang-switch";
import CountDownButton from "@/views/my-components/count-down-button";
import util from "@/libs/util.js";

export default {
  components: {
    CountDownButton,
    LangSwitch,
    Header,
    Footer
  },
  data() {
    return {
      captchaId: "",
      captchaImg: "",
      loadingCaptcha: true,
      error: false,
      tabName: "username",
      saveLogin: true,
      loading: false,
      sending: false,
      errorCode: "",
      form: {
        username: "admin",
        password: "123456",
        code: ""
      },
      rules: {
        username: [
          {
            required: true,
            message: "账号不能为空",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "密码不能为空",
            trigger: "blur"
          }
        ],
        imgCode: [
          {
            required: true,
            message: "验证码不能为空",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    getCaptchaImg() {
      this.loadingCaptcha = true;
      initCaptcha().then(res => {
        this.loadingCaptcha = false;
        if (res.success) {
          this.captchaId = res.result;
          this.captchaImg = drawCodeImage + this.captchaId;
        }
      });
    },
    submitLogin() {
      if (this.tabName === "username") {
        this.$refs.usernameLoginForm.validate(valid => {
          if (valid) {
            this.loading = true;
            login({
              username: this.form.username,
              password: this.form.password,
              code: this.form.imgCode,
              captchaId: this.captchaId,
              saveLogin: this.saveLogin
            }).then(res => {
              if (res.success) {
                this.setStore("authorization", res.result);
                // 获取用户信息
                userInfo().then(res => {
                  if (res.success) {
                    // 避免超过大小限制
                    delete res.result.permissions;
                    let roles = [];
                    res.result.roles.forEach(e => {
                      roles.push(e.name);
                    });
                    this.setStore("roles", roles);
                    this.setStore("saveLogin", this.saveLogin);
                    if (this.saveLogin) {
                      // 保存7天
                      Cookies.set("userInfo", JSON.stringify(res.result), {
                        expires: 7
                      });
                    } else {
                      Cookies.set("userInfo", JSON.stringify(res.result));
                    }
                    this.setStore("userInfo", res.result);
                    this.$store.commit("setAvatarPath", res.result.avatar);
                    // 加载菜单
                    util.initRouter(this);
                    this.$router.push({
                      name: "home_index"
                    });
                  } else {
                    this.loading = false;
                  }
                });
              } else {
                this.loading = false;
                this.getCaptchaImg();
              }
            });
          }
        });
      }
    },
    relatedLogin() {}

  },
  mounted() {
    this.relatedLogin();
    this.getCaptchaImg();
  }
};
</script>

<style lang="less">
@import "./login.less";
</style>
