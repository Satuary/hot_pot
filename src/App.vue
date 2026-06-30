<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { isLogin } from '@/utils/auth';

onLaunch(() => {
    console.log('[HotPot] App Launch');
    // 未登录时，跳转到登录页；已登录则正常进入应用，不做额外跳转
    if (!isLogin()) {
        uni.reLaunch({
            url: '/pages/login/login',
        });
    }
});
onShow(() => {
    console.log('[HotPot] App Show');
});
onHide(() => {
    console.log('[HotPot] App Hide');
});
</script>
<style lang="scss">
@import './styles/index.scss';
</style>
