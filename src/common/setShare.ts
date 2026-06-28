export const setShareDate = (type?: any, data?: any) => {
    let obj = {
        branch_id: data.branch_id,
        activity_id: data.activity_id,
        manager_id: uni.getStorageSync('manager_id') || '',
        type: uni.getStorageSync('user_type') || '',
        pid: uni.getStorageSync('id') || '', //上级
        resuorce_type: type, //资源类型
        resource_id: data.id, //资源id
        other: data.other,
    };
    let pagesData = {
        title: data.title,
        path: data.url + '?data=' + encodeURIComponent(JSON.stringify(obj)),
    };
    return pagesData;
};
// 设置缓存信息
export const setCacheInformation = (data?: any) => {
    if (!data) return;
    const obj = Object.assign(
        {
            branch_id: '',
            activity_id: '',
            manager_id: '',
            type: '',
            pid: '', //上级
            resuorce_type: '', //资源类型
            resource_id: '', //资源id
            channel: 3,
        },
        data,
    );
    uni.setStorageSync('leder', obj);
};
