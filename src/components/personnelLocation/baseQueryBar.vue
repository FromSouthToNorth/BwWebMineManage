<!--
    *名称：弹窗的搜索条件组件
    *功能：methods
      1.点击搜索的方法：@search
      2.搜索条件 props : formItemList
-->
<template>
  <div class="dialog-search">
    <span v-if="title != undefined && title != ''">{{ title }}</span>
    <el-form
      :inline="true"
      ref="ruleForm"
      :model="formInline"
      class="demo-form-inline"
      @keyup.native.enter="onSubmit"
    >
      <el-form-item
        v-for="(item, index) in formItemList"
        :key="index"
        class="descClass"
        :label="item.label"
      >
        <el-select
          :clearable="isClearble"
          id="fuck"
          v-if="item.type == 'select'"
          v-model="formInline[item.param]"
          :placeholder="item.placeholder"
          size="small"
          :style="{ width: item.width || '170px' }"
          :popper-append-to-body="false"
          filterable
          @change="SelectChange"
          @focus="focus"
          @blur="focus"
        >
          <el-option
            v-for="(item2, index2) in item.selectOptions"
            :key="index2"
            :label="item2.name"
            :value="item2.value"
          ></el-option>
        </el-select>
        <el-input
          v-if="item.type == 'input'"
          v-model="formInline[item.param]"
          :style="{ width: isMobile() ? '' : '150px' }"
          size="small"
          id="fuck"
          :placeholder="item.placeholder"
        ></el-input>
        <el-date-picker
          v-if="item.type == 'date' || item.type == 'datetime'"
          v-model="formInline[item.param]"
          :style="{
            width: isMobile()
              ? ''
              : item.type == 'date'
              ? '150px !important'
              : '200px !important',
          }"
          :type="item.type"
          id="fuck"
          placeholder="选择日期"
          :clearable="isClearble"
          popper-class="elDatePicker"
          @change="dateChange"
        >
        </el-date-picker>
      </el-form-item>

      <el-form-item class="descClass BtnDescClass">
        <div class="btnList">
          <el-button
            icon="el-icon-search"
            class="query"
            v-if="query"
            type="primary"
            size="small"
            @click="onSubmit"
            >{{ queryName }}</el-button
          >
          <el-button
            v-if="reSet"
            type="primary"
            size="small"
            class="reset"
            icon="el-icon-refresh-right"
            @click="resetForm('ruleForm')"
            >{{ resetName }}</el-button
          >
          <!-- 可用于显示其他按钮 -->
          <slot v-for="item in customBtn" :name="item.soltName">
            <el-button
              :class="item.type"
              class="custom"
              size="small"
              @click="soltHandel(item.btnName)"
            >
              {{ item.btnName }}
            </el-button>
          </slot>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { formatterDate } from "@/views/personnel_location/downholeInfoJs";
export default {
  name: "BaseQuery",
  props: {
    title: String,
    changeSearch: {
      // 改变时触发
      type: Boolean,
      default() {
        return false;
      },
    },
    /* 其他自定义按钮 */
    customBtn: Array,
    /* 查询栏数组 */
    formItemList: {
      type: Array,
      default() {
        return [
          {
            type: "select",
            placeholder: "选择部门",
            selectOptions: [
              { name: 111, value: 111 },
              { name: 222, value: 222 },
            ],
            param: "company",
            defaultSelect: "222", // 下拉框默认选中项
          },
          {
            label: "输入框",
            type: "input",
            param: "name",
          },
        ];
      },
    },
    /* 是否具有清除按钮 */
    isClearble: {
      type: Boolean,
      default() {
        return true;
      },
    },
    /* 是否有查询按钮 */
    query: {
      type: Boolean,
      default() {
        return true;
      },
    },
    queryName: {
      type: String,
      default: "查询",
    },
    /* 是否有重置按钮 */
    reSet: {
      type: Boolean,
      default() {
        return false;
      },
    },
    resetName: {
      type: String,
      default: "重置",
    },
    /* 是否显示label */
    showLabel: {
      type: Boolean,
      default() {
        return false;
      },
    },
    loading: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    let formInline = {};
    for (const obj of this.formItemList) {
      /* 下拉框设置默认值 */
      formInline[obj.param] = obj.defaultSelect || "";
    }
    return {
      formInline,
    };
  },
  watch: {
    formItemList: {
      handler(newVal, oldVal) {
        for (const obj of this.formItemList) {
          if (obj.defaultSelect) {
            this.formInline[obj.param] = obj.defaultSelect;
          }
        }
      },
      deep: true,
    },
  },
  methods: {
    /* 获取访问设备 */
    isMobile() {
      let flag = navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
      );
      // localStorage.setItem('isiphone',flag)
      return flag;
    },
    /* 去除 readOnly 属性，解决苹果手机下拉框不能唤起软键盘 */
    focus() {
      const el = document.getElementById("fuck")
      if (el) el.removeAttribute("readOnly")
    },
    /* 提交 */
    onSubmit() {
      /* 日期格式化 */
      this.formItemList.forEach((item, index) => {
        if (item.type == "date" || item.type == "datetime") {
          if (!this.formInline[item.param]) {
            this.formInline[item.param] = null; // 或者设置为空字符串 ''
          } else {
            this.formInline[item.param] = formatterDate(
              this.formInline[item.param],
              item.type == "date" ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm:ss"
            );
          }
        }
      });
      this.$emit("search", this.formInline);
      //this.$refs.table.currentPage=1;
    },
    /* 自定义按钮点击事件 */
    soltHandel(text) {
      this.$emit("soltHandel", this.formInline, text);
    },
    /* 日期控件改变时 */
    dateChange(value) {
      let str = null;
      this.formItemList.forEach((item, index) => {
        if (item.type == "date" || item.type == "datetime") {
          str = formatterDate(
            value,
            item.type == "date" ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm:ss"
          );
        }
      });
      if (this.changeSearch) {
        this.$emit("search", str);
      }
    },
    resetForm(formName) {
      let date;
      for (const obj of this.formItemList) {
        if (obj.type == "date" || obj.type == "datetime") {
          if (obj.defaultSelect) {
            date = formatterDate(
              obj.defaultSelect,
              obj.type == "date" ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm:ss"
            );
            obj.defaultSelect = date;
          }
        }
        this.formInline["Page"] = 1;
        this.formInline[obj.param] = obj.defaultSelect || null; // 重置时下拉框的默认值如果要保留就选用这个
        //  //formInline[obj.param] = "";  // 所有筛选条件清空
      }

      this.$emit("search", this.formInline);
    },
    /* 下拉框改变事件 */
    SelectChange(value) {
      /* 配置了立即搜索才行 */
      if (this.changeSearch) {
        this.$emit("search", this.formInline);
      }
    },
  },
  mounted() {
    /* 去除 readOnly 属性，解决苹果手机下拉框不能唤起软键盘 */
    if (this.formItemList.length != 0) {
      const el = document.getElementById("fuck")
      if (el) el.removeAttribute("readOnly")
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/root.scss";

@media screen and (max-width: 700px) {
  /* 当屏幕宽度小于等于700px时应用的样式 */
  .demo-form-inline {
    display: flex;
    flex-flow: wrap;
    align-items: center;
    margin-left: 10px;
  }

  .descClass {
    width: 100%;
  }

  ::v-deep .el-form-item--medium .el-form-item__content {
    width: 85%;

    .btnList {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin-left: 10px;
    }
  }
}

.dialog-search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  margin-bottom: 15px;

  /* 日期组件样式 */
  ::v-deep .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    // width: var(--inputWidth) !important;
    width: 100%;

    .el-input__inner {
      width: 100%;
    }
  }

  /* 查询栏底部外边距 */
  ::v-deep .el-form-item,
  .el-form-item--medium {
    margin-bottom: 0;
  }

  /* 输入框的样式 */
  ::v-deep .el-input__inner {
    width: 100%;
    border: 1px solid rgb(130 153 194 / 40%);
    // background: var(--input-bgColor);
    background: transparent;
    color: var(--input-textColor);
  }

  /* 选项框的样式 */
  ::v-deep .el-select-dropdown {
    margin: 0;
    padding: 0;
    border: 1px solid rgb(130 153 194 / 40%);
    border-radius: 0;
    // background-color: #213042;
    background-color: var(--input-bgColor);
  }

  /* label */
  ::v-deep .el-form-item--medium .el-form-item__label {
    // color: white;
    color: var(--input-textColor);
  }

  /* 修改选项的样式 */
  ::v-deep .el-select-dropdown__item {
    // color: #fff;
    color: var(--input-textColor);
  }

  /* 修改选项选中时样式 */
  ::v-deep .el-select-dropdown__item.hover,
  ::v-deep .el-select-dropdown__item:hover {
    background: rgb(248 196 62 / 6%);
    color: #409eff;
  }

  /* 去掉下拉上面的尖角 */
  ::v-deep .el-popper .popper__arrow,
  .el-popper .popper__arrow::after {
    display: none;
  }
}
</style>
