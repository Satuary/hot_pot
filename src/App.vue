<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { isLogin, isProfileComplete } from '@/utils/auth';

onLaunch(() => {
    console.log('[HotPot] App Launch');
    // 未登录 -> 登录页
    if (!isLogin()) {
        uni.reLaunch({
            url: '/pages/login/login',
        });
        return;
    }
    // 已登录但未完善资料 -> 完善资料页（刷新页面也不会跳到首页）
    if (!isProfileComplete()) {
        uni.reLaunch({
            url: '/pages/profile/complete',
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
