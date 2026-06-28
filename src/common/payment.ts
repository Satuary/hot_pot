import { wechatPay } from '@/api/api';
export const WxPayMent = async (val: any) => {
    const data = { price: val.price, order: val.order, title: val.name };
    const res: any = await wechatPay(data);
    if (res.code == 200) {
        uni.requestPayment({
            provider: 'wxpay',
            orderInfo: {},
            timeStamp: res.data.timestamp + '',
            nonceStr: res.data.noncestr,
            package: res.data.package,
            signType: res.data.signType,
            paySign: res.data.paySign,
            success(res: any) {
                uni.showToast({ title: '成功', duration: 2000 });
            },
            fail(e: any) {
                uni.showToast({ title: '支付失败', icon: 'error', duration: 2000 });
            },
        });
    } else {
        uni.showToast({ icon: 'error', title: res.msg });
    }
};
