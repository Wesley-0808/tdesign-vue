import Vue, { VueConstructor, PluginObject } from 'vue';
import { capitalize } from 'lodash-es';

export function withInstall<T>(comp: T, dep?: PluginObject<any>, directive?: { name: string; comp: unknown }) {
  const c = comp as any;

  const name = c?.options?.name || c.name;

  c.install = function (Vue: VueConstructor, config?: object) {
    const defaults = { prefix: 't' };
    const installConfig = { ...defaults, ...config };
    /// 为保证组件名称简洁，前缀保持为一个单词，首字母大写
    const defaultPrefix = capitalize(defaults.prefix);
    // mapprops component is original component
    let componentName = name.replace(defaultPrefix, '').replace('-mapprops', '');
    componentName = capitalize(installConfig.prefix) + componentName;

    Vue.component(componentName, comp);
  };

  if (dep && Vue && (Vue._installedPlugins || []).indexOf(dep) === -1) {
    Vue.use(dep);
  }

  if (directive) {
    Vue.directive(directive.name, directive.comp);
  }

  return comp as T & PluginObject<T>;
}

export default withInstall;
