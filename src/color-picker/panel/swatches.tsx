import {
  computed, defineComponent, PropType, ref,
} from '@vue/composition-api';
import { DeleteIcon as TdDeleteIcon, AddIcon as TdAddIcon } from 'tdesign-icons-vue';
import { cloneDeep } from 'lodash-es';
import { Select as TSelect, Option as TOption } from '../../select';
import { Color } from '../utils';
import { useBaseClassName } from '../hooks';
import { useConfig, usePrefixClass } from '../../hooks/useConfig';
import { useGlobalIcon } from '../../hooks/useGlobalIcon';
import useCommonClassName from '../../hooks/useCommonClassName';
import baseProps from './base-props';
import { Button as TButton } from '../../button';
import { TdColorHandler } from '../interfaces';

export default defineComponent({
  name: 'SwatchesPanel',
  components: {
    TSelect,
    TOption,
    TButton,
  },
  props: {
    ...baseProps,
    colors: {
      type: Array as PropType<string[]>,
      default: () => [] as PropType<string[]>,
    },
    title: {
      type: String,
      default: '系统色彩',
    },
    editable: {
      type: Boolean,
      default: false,
    },
    handleSetColor: {
      type: Function as PropType<TdColorHandler>,
      default: () => () => {},
    },
    handleAddColor: {
      type: Function as PropType<TdColorHandler>,
      default: () => () => {},
    },
  },
  setup(props) {
    const baseClassName = useBaseClassName();
    const { t, global } = useConfig('colorPicker');
    const { global: confirmGlobal } = useConfig('popconfirm');
    const classPrefix = usePrefixClass();
    const { DeleteIcon, AddIcon } = useGlobalIcon({ DeleteIcon: TdDeleteIcon, AddIcon: TdAddIcon });

    const { statusClassNames } = useCommonClassName();
    const visiblePopConfirm = ref<boolean>(false);
    const colorInstance = computed(() => cloneDeep(props.color));
    const setVisiblePopConfirm = (visible: boolean) => {
      visiblePopConfirm.value = visible;
    };

    const handleClick = (color: string) => {
      props.handleSetColor(color);
    };

    const isEqualCurrentColor = (color: string) => Color.compare(color, colorInstance.value.css);

    const selectedColorIndex = computed(() => props.colors.findIndex((color) => isEqualCurrentColor(color)));

    /**
     * 移除颜色
     */
    const handleRemoveColor = () => {
      const { colors } = props;
      const selectedIndex = selectedColorIndex.value;
      if (selectedIndex === -1) return;
      colors.splice(selectedIndex, 1);
      props.handleChange?.(colors);
      setVisiblePopConfirm(false);
    };

    return {
      t,
      global,
      confirmGlobal,
      classPrefix,
      DeleteIcon,
      AddIcon,
      baseClassName,
      statusClassNames,
      selectedColorIndex,
      visiblePopConfirm,
      setVisiblePopConfirm,
      handleClick,
      isEqualCurrentColor,
      handleRemoveColor,
    };
  },
  render() {
    const {
      baseClassName, statusClassNames, title, editable, DeleteIcon, AddIcon,
    } = this;
    const swatchesClass = `${baseClassName}__swatches`;

    const renderActions = () => {
      if (!editable) {
        return null;
      }
      return (
        <div class={`${swatchesClass}--actions`}>
          <span role="button" class={`${baseClassName}__icon`} onClick={() => this.handleAddColor()}>
            <AddIcon />
          </span>
          {this.colors.length > 0 ? (
            <span role="button" class={`${baseClassName}__icon`} onClick={() => this.handleRemoveColor()}>
              <DeleteIcon />
            </span>
          ) : null}
        </div>
      );
    };

    return (
      <div class={swatchesClass}>
        <h3 class={`${swatchesClass}--title`}>
          <span>{title}</span>
          {renderActions()}
        </h3>
        <ul class={[`${swatchesClass}--items`, 'narrow-scrollbar']}>
          {this.colors.map((color) => (
            <li
              class={[
                `${swatchesClass}--item`,
                this.isEqualCurrentColor(color) && editable ? statusClassNames.active : '',
              ]}
              key={color}
              onClick={() => {
                if (this.disabled) {
                  return;
                }
                this.handleClick(color);
              }}
            >
              <div class={[`${swatchesClass}--color`, `${baseClassName}--bg-alpha`]}>
                <span
                  class={`${swatchesClass}--inner`}
                  style={{
                    background: color,
                  }}
                ></span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  },
});
