export const handleMessageSubscription = () => {
    uni.requestSubscribeMessage({
        tmplIds: ['xx', 'xx', 'xx'],
        success(res: any) {
            console.log('订阅成功====', res);
        },
        fail(fail: any) {
            console.log('订阅失败====', fail);
            uni.showToast({
                title: '订阅失败',
                icon: 'error',
            });
        },
        complete: (c: any) => {
            console.log('complete====', c);
        },
    });
};
