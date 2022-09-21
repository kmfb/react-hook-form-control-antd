import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Form, Spin } from "antd";
import {
  useController,
  ControllerProps,
  ControllerFieldState,
} from "react-hook-form";

import { FormItemProps } from "antd/es/form";

import { isFalsy } from "./utils";

type ChildrenComponentType = "select" | "input" | "";

export interface HooksFormItemProps extends FormItemProps {
  name: ControllerProps["name"];
  control: ControllerProps<any>["control"];
  rules?: ControllerProps["rules"];
  labelText?: string;
  defaultValue?: ControllerProps["defaultValue"];
  valuePropName?: string;
  trigger?: string;
  getValueFromEvent?: (event: any) => any;
  hostUIValueState?: (value: any) => any;
  loading?: boolean;
}

// 如果直接赋值给 FormItem, 会导致 FormItem 里头 labelCol in props 的逻辑判断为 true， 从而使设置的布局未生效
const getLayoutProps = ({ labelAlign, labelCol, wrapperCol }: any) => {
  const layoutProps: any = {};

  if (labelAlign) {
    layoutProps["labelAlign"] = labelAlign;
  }

  if (labelCol) {
    layoutProps["labelCol"] = labelCol;
  }

  if (wrapperCol) {
    layoutProps["wrapperCol"] = wrapperCol;
  }

  return layoutProps;
};

const getRules = (
  rules: ControllerProps["rules"],
  options: { required?: boolean | string; label: string }
) => {
  let newRules = { ...rules };

  if (options?.required) {
    if (typeof options?.required === "string") {
      newRules.required = options.required;
    } else {
      newRules.required = `${options?.label}不能为空`;
    }
  }

  return newRules;
};

const getValidateStatus = (fieldState: ControllerFieldState) => {
  let validateStatus: FormItemProps["validateStatus"] = "";

  if (fieldState?.error) {
    validateStatus = "error";
  }

  if (fieldState.isDirty && !fieldState?.error) {
    validateStatus = "success";
  }

  return validateStatus;
};

const getHelpMessage = (fieldState: ControllerFieldState) => {
  return fieldState?.error?.message;
};

const getPlaceholder = ({
  metadata,
  componentType,
  labelText,
}: {
  metadata: React.ReactElement;
  componentType: ChildrenComponentType;
  labelText: string;
}) => {
  if (!isFalsy(metadata?.props.placeholder)) return metadata?.props.placeholder;

  if (componentType === "select") {
    return `请选择${labelText}`;
  }

  return `请输入${labelText}`;
};

const InternalFormItem: React.FC<HooksFormItemProps> = (props) => {
  const {
    name,
    control,
    defaultValue,
    label,
    labelText = label,
    labelCol,
    wrapperCol,
    labelAlign,
    rules = {},
    required,
    hasFeedback,
    style,
    valuePropName = "value",
    trigger = "onChange",
    getValueFromEvent,
    hostUIValueState,
    loading = false,
    ...antdProps
  } = props;

  /**
   * 为了解决在生产环境无法正确判断children的组件名称这个问题，
   * 改用判断formitem下的DOM节点是否包含了特定的classname，
   * 这边要注意不应该去设置 children的 ref，因为外部可能还会设置ref属性，所以这边通过设置 formitem 的 ref
   */
  const formItemRef = useRef();
  const [childrenComponentType, setChildrenComponentType] =
    useState<ChildrenComponentType>("");

  const layoutProps = getLayoutProps({ labelCol, wrapperCol, labelAlign });

  const isRequired = required || Object.keys(rules).includes("required");
  const rulesProp = getRules(rules, { required, label: labelText as string });

  useEffect(() => {
    const dom = ReactDOM.findDOMNode(formItemRef.current) as Element;
    if (!dom) {
      return () => {}
    }
    const selectNodelist = dom.querySelectorAll(".ant-select");

    switch (true) {
      case selectNodelist.length > 0:
        setChildrenComponentType("select");
        break;

      default:
        setChildrenComponentType("");
        break;
    }
  }, []);

  const { field, fieldState } = useController({
    name,
    control,
    rules: rulesProp,
    defaultValue,
  });

  const [UIValueState, setUIValueState] = useState(() => {
    if (field) {
      if (hostUIValueState) {
        return hostUIValueState(field.value);
      }
    }
  });

  const validateStatus = getValidateStatus(fieldState);
  const help = getHelpMessage(fieldState);
  const placeholder = getPlaceholder({
    metadata: props.children as React.ReactElement,
    componentType: childrenComponentType,
    labelText: labelText as string,
  });

  const defaultProxyProps = {
    [valuePropName]: field.value,
    [trigger](event: any) {
      let value = event;

      if (getValueFromEvent) {
        value = getValueFromEvent(event);
      }

      field.onChange(value);

      if (hostUIValueState) {
        const uValue = hostUIValueState(value);
        setUIValueState(uValue);
      }

      // @ts-expect-error
      if (props.children?.props?.[trigger]) {
        // @ts-expect-error
        props.children!.props[trigger](...arguments);
      }
    },
  };

  const getProxyProps = () => {
    if (!props.children) {
      return defaultProxyProps;
    }
    // @ts-expect-error
    if (!props.children.props) {
      return defaultProxyProps;
    }
    // @ts-expect-error
    if (props.children.props["onBlur"]) {
      return {
        ...defaultProxyProps,
        // @ts-expect-error
        onBlur: props.children.props["onBlur"],
      };
    }

    return defaultProxyProps;
  };

  const FormItemInner = (
    <Form.Item
      {...antdProps}
      label={label}
      required={isRequired}
      validateStatus={validateStatus}
      help={help}
      hasFeedback={hasFeedback}
      {...layoutProps}
      style={style}
      ref={formItemRef}
    >
      {React.cloneElement(props.children as React.ReactElement, {
        ...field,
        ...getProxyProps(),
        placeholder,
        ...(hostUIValueState && {
          value: UIValueState,
        }),
      })}
    </Form.Item>
  );

  return loading ? <Spin>{FormItemInner}</Spin> : FormItemInner;
};

export const PureFormItem = Form.Item;

export default InternalFormItem;
