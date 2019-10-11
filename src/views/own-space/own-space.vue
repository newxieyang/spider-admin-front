<style lang="less" scoped>
@import "./own-space.less";
</style>

<template>
  <div class="own-space">
    <Card class="own-space-new">
      <div class="own-wrap">
        <div style="width:240px">
          <Menu active-name="基本信息" theme="light" @on-select="changeMenu">
            <MenuItem name="基本信息">基本信息</MenuItem>
            <MenuItem name="安全设置">安全设置</MenuItem>
            <MenuItem name="消息通知">消息通知</MenuItem>
          </Menu>
        </div>
        <div style="padding: 8px 40px;width:100%">
          <div class="title">{{currMenu}}</div>
          <div>
            <div v-show="currMenu=='基本信息'">
              <Form ref="userForm" :model="userForm" :label-width="90" label-position="left">
                <FormItem label="用户头像：">
                  <upload-pic-thumb
                    @on-change="userForm.avatar=$event"
                    :multiple="false"
                    ref="uploadThumb"
                  ></upload-pic-thumb>
                </FormItem>
                <FormItem label="昵称：" prop="nickName">
                  <Input v-model="userForm.nickName" style="width: 250px" />
                </FormItem>
                <FormItem label="性别：">
                  <RadioGroup v-model="userForm.sex">
                    <Radio v-for="(item, i) in dictSex" :key="i" :label="item.value">{{item.title}}</Radio>
                  </RadioGroup>
                </FormItem>
                <FormItem label="个人简介：" prop="description">
                  <Input
                    v-model="userForm.description"
                    type="textarea"
                    style="width: 250px"
                    :autosize="{minRows: 3,maxRows: 5}"
                    placeholder="个人简介"
                  ></Input>
                </FormItem>
                <FormItem label="国家/地区：">
                  <Select v-model="area" style="width: 250px">
                    <Option :value="86">中国</Option>
                  </Select>
                </FormItem>
                <FormItem label="所在省市：">
                  <al-cascader
                    v-model="userForm.addressArray"
                    @on-change="changeAddress"
                    data-type="code"
                    level="2"
                    style="width:250px"
                  />
                </FormItem>
                <FormItem label="街道地址：" prop="street">
                  <Input v-model="userForm.street" style="width: 250px" />
                </FormItem>
                <FormItem label="所属部门：">
                  <span>{{ userForm.departmentTitle }}</span>
                </FormItem>
                <FormItem label="用户类型：">
                  <span>{{ userForm.typeTxt }}</span>
                </FormItem>
                <FormItem label="注册时间：">
                  <span>{{ userForm.createTime }}</span>
                </FormItem>
                <FormItem>
                  <Button
                    type="primary"
                    style="width: 100px;margin-right:5px"
                    :loading="saveLoading"
                    @click="saveEdit"
                  >保存</Button>
                </FormItem>
              </Form>
            </div>
            <div v-show="currMenu==='安全设置'" class="safe">
              <div class="item">
                <div>
                  <div class="title">账户密码</div>
                  <div v-if="userForm.passStrength" class="desc">
                    当前密码强度：
                    <span
                      v-if="userForm.passStrength==='弱'"
                      class="red"
                    >{{userForm.passStrength}}</span>
                    <span v-if="userForm.passStrength==='中'" class="middle">{{userForm.passStrength}}</span>
                    <span v-if="userForm.passStrength==='强'" class="green">{{userForm.passStrength}}</span>
                  </div>
                </div>
                <div>
                  <a @click="changePass">修改</a>
                </div>
              </div>
              <div class="item">
                <div>
                  <div class="title">绑定手机</div>
                  <div class="desc">
                    <span v-if="userForm.mobile">已绑定手机：{{userForm.mobile}}</span>
                    <span v-else>未绑定手机号</span>
                  </div>
                </div>
                <div>
                  <a @click="showChangeMobile">修改</a>
                </div>
              </div>
              <div class="item">
                <div>
                  <div class="title">绑定邮箱</div>
                  <div class="desc">
                    <span v-if="userForm.email">已绑定邮箱：{{userForm.email}}</span>
                    <span v-else>未绑定邮箱</span>
                  </div>
                </div>
                <div>
                  <a @click="showChangeEmail">修改</a>
                </div>
              </div>
              <div class="item">
                <div>
                  <div class="title">密保问题</div>
                  <div class="desc">未设置密保问题，密保问题可有效保护账户安全</div>
                </div>
                <div>
                  <a>暂不支持设置</a>
                </div>
              </div>
            </div>

            <div v-show="currMenu=='消息通知'" class="safe">
              <div class="item">
                <div>
                  <div class="title">系统消息</div>
                  <div class="desc">系统消息将以站内信的形式通知</div>
                </div>
                <div>
                  <i-switch
                    v-model="messageOpen"
                    @on-change="changeMessage"
                    :true-value="1"
                    :false-value="0"
                  >
                    <span slot="open">开</span>
                    <span slot="close">关</span>
                  </i-switch>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>



  </div>
</template>

<script>
import {
  userInfo,
  userInfoEdit,
  relatedInfo,
  sendEditEmail,
  editEmail,
  sendEditMobileSms,
  changeMobile
} from "@/api/index";
import { validateMobile } from "@/libs/validate";
import CountDownButton from "@/views/my-components/count-down-button";
import uploadPicThumb from "@/views/my-components/spider/upload-pic-thumb";
import checkPassword from "@/views/my-components/spider/check-password";
import Cookies from "js-cookie";
export default {
  components: {
    uploadPicThumb,
    checkPassword,
    CountDownButton
  },
  name: "ownspace_index",
  data() {
    return {
      area: 86,
      messageOpen: 1,
      userForm: {
        id: "",
        avatar: "",
        username: "",
        sex: "",
        mobile: "",
        email: "",
        status: "",
        type: "",
        typeTxt: "",
        address: "",
        addressArray: []
      },
      mobileEditForm: {
        mobile: "",
        code: ""
      },
      emailEditForm: {
        email: "",
        code: ""
      },
      codeError: "",
      initPhone: "",
      initEmail: "",
      saveLoading: false,
      sending: false,
      getSms: "获取验证码",
      canSendMobileCode: false, // 是否可点获取验证码
      checkCodeLoading: false,
      checkPassLoading: false,
      editEmailLoading: false,
      mobileEditValidate: {
        mobile: [
          { required: true, message: "请输入手机号码" },
          { validator: validateMobile }
        ]
      },
      emailEditValidate: {
        email: [
          { required: true, message: "请输入邮箱地址" },
          { type: "email", message: "邮箱格式不正确" }
        ]
      },
      editMobileVisible: false, // 显示填写验证码box
      editEmailVisible: false,
      canSendEditEmail: false,
      github: {
        related: false,
        id: "",
        username: ""
      },
      qq: {
        related: false,
        id: "",
        username: ""
      },
      weibo: {
        related: false,
        id: "",
        username: ""
      },
      jumping: false,
      currMenu: "基本信息",
      dictSex: this.$store.state.dict.sex
    };
  },
  methods: {
    init() {
      let v = JSON.parse(Cookies.get("userInfo"));
      // 转换null为""
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let userInfo = JSON.parse(str);
      userInfo.addressArray = [];
      this.userForm = userInfo;
      this.initPhone = userInfo.mobile;
      this.mobileEditForm.mobile = userInfo.mobile;
      this.initEmail = userInfo.email;
      this.emailEditForm.email = userInfo.email;
      this.$refs.uploadThumb.setData(userInfo.avatar);
      if (userInfo.address) {
        this.userForm.address = userInfo.address;
        this.userForm.addressArray = JSON.parse(userInfo.address);
      }
      if (this.userForm.type == 0) {
        this.userForm.typeTxt = "普通用户";
      } else if (this.userForm.type == 1) {
        this.userForm.typeTxt = "管理员";
      }
      let messageOpen = this.getStore("messageOpen");
      if (
        messageOpen !== "" &&
        messageOpen !== undefined &&
        messageOpen !== null
      ) {
        this.messageOpen = Number(messageOpen);
      } else {
        this.setStore("messageOpen", 1);
      }
    },
    changePass() {
      this.$router.push({
        name: "change_pass"
      });
    },
    changeMenu(v) {
      this.currMenu = v;
    },
    showChangeMobile() {
      this.$refs.checkPassMobile.show();
    },
    showChangeEmail() {
      this.$refs.checkPassEmail.show();
    },
    saveEdit() {
      this.saveLoading = true;
      let params = this.userForm;
      userInfoEdit(params).then(res => {
        this.saveLoading = false;
        if (res.success) {
          this.$Message.success("保存成功");
          // 更新用户信息
          Cookies.set("userInfo", this.userForm);
          // 更新头像
          this.$store.commit("setAvatarPath", this.userForm.avatar);
        }
      });
    },
    changeAddress() {
      this.userForm.address = JSON.stringify(this.userForm.addressArray);
    },

    changeMessage(v) {
      this.setStore("messageOpen", v);
    }
  },
  mounted() {
    this.init();
  }
};
</script>
