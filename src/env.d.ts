/// <reference types="vite/client" />
/// <reference types="@dcloudio/types" />

declare module '*.vue' {
    const component: import('vue').DefineComponent<object, object, any>;
    export default component;
}
