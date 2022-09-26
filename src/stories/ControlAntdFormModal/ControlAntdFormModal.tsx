import { Button } from "antd";
import React from "react";
import { useFormContext } from "react-hook-form";
import { ControlAntdFormModal, FormValueDisplay } from "../..";
import { IControlAntdFormItems } from "../../types";

import CreateWrapper from "../components/CreateWrapper";

const UD_FORM_LAYOUT_MODAL = {
  labelCol: {
    md: 8,
  },
  wrapperCol: {
    md: 12,
  },
};

const items: IControlAntdFormItems = [
  {
    label: "Name",
    name: "name",
    rules: {
      maxLength: { value: 10, message: "模板名称字符长度不能超过10个" },
    },
  },
];

function ControlAntdFormModalS() {
  const methods = useFormContext();

  return (
    <div>
      <ControlAntdFormModal
        methods={methods}
        items={items}
        handleModalOk={({ setConfirmLoading, setVisible }) => {
          setConfirmLoading(true);
          setVisible(false);
          console.log("handleModalOk");
        }}
        modalConfig={{
          title: "模板名称",
          destroyOnClose: true,
        }}
      
      >
        <Button>点击</Button>
      </ControlAntdFormModal>
      <ControlAntdFormModal
        methods={methods}
        items={items}
        handleModalOk={({ setConfirmLoading, setVisible }) => {
          setConfirmLoading(true);
          setVisible(false);
          console.log("handleModalOk");
        }}
        modalConfig={{
          title: "模板名称",
          destroyOnClose: true,
        }}
        formConfig={{
          layout: UD_FORM_LAYOUT_MODAL,
        }}
        modalChildren={<div>hello</div>}
      >
        <Button>点击</Button>
      </ControlAntdFormModal>
      <FormValueDisplay />
    </div>
  );
}

export default CreateWrapper(<ControlAntdFormModalS />);
