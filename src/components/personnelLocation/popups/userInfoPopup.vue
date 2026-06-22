<template>
  <el-dialog class="pl-user-dialog" title="个人信息" v-model="showPopup" :width="cliWidth + 'px'" :append-to-body="false"
    :modal="true" :close-on-click-modal="false" @close="close">
    <table class="x-table" :style="{ width: `${cliWidth}px` }" cellspacing="0" id="7" cellpadding="0">
      <colgroup :style="{ width: `${cliWidth}px` }">
        <col style="width: 25%" col="0" />
        <col style="width: 25%" col="1" />
        <col style="width: 25%" col="2" />
        <col style="width: 25%" col="3" />
      </colgroup>
      <tbody class="rows-height-counter" :style="{ width: `${cliWidth}px` }">
        <tr style="height: 44px" tridx="0" id="r-0-0">
          <td class="title" id="A1-0-7">工号</td>
          <td class="title" id="B1-0-7">卡号</td>
          <td class="fh bw pl2 brw1 brss bbw1 bbss blw1 blss btw1 btss" rowspan="6" colspan="2" id="C1-0-7">
            <div v-if="result.photo && result.photo !== ''">
              <el-image style="width: 100%; height: 100%; border: 0" :src="result.photo">
                <template #error>
                  <div class="image-slot">
                    <span>未上传图片</span>
                  </div>
                </template>
              </el-image>
            </div>
            <div v-else class="image-slot">
              <span>未上传图片</span>
            </div>
          </td>
        </tr>
        <tr style="height: 44px" tridx="1" id="r-1-0">
          <td class="content" id="A2-0-7">
            {{
              result.workNumber == null || result.workNumber == ""
                ? "-"
                : result.workNumber
            }}
          </td>
          <td class="content" id="B2-0-7">
            {{
              result.SenderID == null || result.SenderID == ""
                ? "-"
                : result.SenderID
            }}
          </td>
        </tr>
        <tr style="height: 44px" tridx="2" id="r-2-0">
          <td class="title" id="A3-0-7">性别</td>
          <td class="title" id="B3-0-7">姓名</td>
        </tr>
        <tr style="height: 45px" tridx="3" id="r-3-0">
          <td class="content" id="A4-0-7">
            {{ result.sex == null || result.sex == "" ? "-" : result.sex }}
          </td>
          <td class="content" id="B4-0-7">
            {{
              result.userName == null || result.userName == ""
                ? "-"
                : result.userName
            }}
          </td>
        </tr>
        <tr style="height: 44px" tridx="4" id="r-4-0">
          <td class="title" id="A5-0-7">学历</td>
          <td class="title" id="B5-0-7">职务</td>
        </tr>
        <tr style="height: 44px" tridx="5" id="r-5-0">
          <td class="content" id="A6-0-7">
            {{
              result.education == null || result.education == ""
                ? "-"
                : result.education
            }}
          </td>
          <td class="content" id="B6-0-7">
            {{
              result.workType == null || result.workType == ""
                ? "-"
                : result.workType
            }}
          </td>
        </tr>
        <tr style="height: 44px" tridx="6" id="r-6-0">
          <td class="title" id="A7-0-7">部门</td>
          <td class="title" id="B7-0-7">工种</td>
          <td class="title" id="C7-0-7">出生年月</td>
          <td class="title" id="D7-0-7">入职时间</td>
        </tr>
        <tr style="height: 45px" tridx="7" id="r-7-0">
          <td class="content" id="A8-0-7">
            {{
              result.department == null || result.department == ""
                ? "-"
                : result.department
            }}
          </td>
          <td class="content" id="B8-0-7">
            {{ result.rank == null || result.rank == "" ? "-" : result.rank }}
          </td>
          <td class="content" id="C8-0-7">
            {{
              result.birthday == null || result.birthday == ""
                ? "-"
                : result.birthday.substring(0, 10)
            }}
          </td>
          <td class="content" id="D8-0-7">
            {{
              result.entryTime == null || result.entryTime == ""
                ? "-"
                : result.entryTime
            }}
          </td>
        </tr>
        <tr style="height: 44px" tridx="8" id="r-8-0">
          <td class="title" colspan="2" id="A9-0-7">身份证</td>
          <td class="title" colspan="2" id="C9-0-7">手机号</td>
        </tr>
        <tr style="height: 44px" tridx="9" id="r-9-0">
          <td class="content" colspan="2" id="A10-0-7">
            {{
              result.iDCard == null || result.iDCard == "" ? "-" : result.iDCard
            }}
          </td>
          <td class="content" colspan="2" id="C10-0-7">
            {{
              result.phone == null || result.phone == "" ? "-" : result.phone
            }}
          </td>
        </tr>
      </tbody>
    </table>
  </el-dialog>
</template>

<script>
import { getpolicy5339 } from "@/api/system/personnelLocation.js";
import { transitionKeyUp } from "@/views/personnel_location/downholeInfoJs";
import PLMixin from "@/mixin/personnelLocationMixin";
export default {
  name: "userInfoPopup",
  mixins: [PLMixin],
  data() {
    return {
      cliWidth: 0,
      result: { photo: "" },
      userInfo: {},
    };
  },
  mounted() { },
  methods: {
    show(userInfo) {
      // 清空之前的用户数据，避免显示上一个用户的信息
      this.result = { photo: "" };
      this.showPopup = true;
      /* 获取页面宽度 */
      let width =
        document.documentElement.clientWidth || document.body.clientWidth;
      if (this.isMobile()) {
        this.cliWidth = width;
      } else {
        this.cliWidth = width / 3.33;
      }
      this.userInfo = userInfo;
      this.loadData();
    },
    close() {
      this.showPopup = false;
    },
    loadData() {
      console.log("loadData");
      let userObj = transitionKeyUp(this.userInfo);
      let options = {
        text: "加载中...",
        target: document.querySelector(".x-table"),
        background: "rgba(255, 255, 255, 0)",
      };

      let loadingInstance = this.$loading(options);
      getpolicy5339(5339, userObj.SenderID)
        .then(({ data }) => {
          if (data.length != 0) {
            // 直接更新result对象，避免清空导致照片闪烁
            this.result = { ...data[0] };
          } else {
            // 没有数据时保持空对象结构
            this.result = { photo: "" };
          }
        })
        .catch((res) => {
          this.$message.error("加载用户数据失败:", res);
          // 加载失败时保持空对象结构
          this.result = { photo: "" };
        })
        .finally((res) => {
          loadingInstance.close();
        });
    },
    isMobile() {
      let flag = navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
      );
      // localStorage.setItem('isiphone',flag)
      return flag;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/root.scss";

table {
  padding: 10px;
  text-align: center;
}

::v-deep .el-image__error {
  background: var(--popup-bgColor);
}

::v-deep .image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--user-popup-contentColor);
}

.title {
  background-color: var(--user-popup-titleBgColor);
  color: var(--user-popup-titleColor);
  font-weight: bold;
}

.content {
  background-color: var(--user-popup-contentBgColor);
  color: var(--user-popup-contentColor);
  font-weight: 400;
}

td {
  border: 1px solid;
  border-color: var(--user-popup-borderColor);
  background-color: var(--popup-bgColor);
  color: var(--text-color);
}

.x-table {
  position: absolute;
  left: 0;
  width: 100% !important;
  border-bottom: 1px;
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
  background: var(--user-popup-contentBgColor);
  font-family: var(--font-family);
}
</style>

<style>
.pl-user-dialog {
  --el-dialog-bg-color: #061b46;
}

.pl-user-dialog .el-dialog__title {
  color: #bfbfbf;
}

.pl-user-dialog .el-dialog__body {
  padding: 10px;
}
</style>
