<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { isLogin } from '@/utils/auth';

onLaunch(() => {
    console.log('[HotPot] App Launch');
    // 已登录则直接跳转到首页，避免停留在登录页
    if (isLogin()) {
        uni.reLaunch({
            url: '/pages/tabBar/match',
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
