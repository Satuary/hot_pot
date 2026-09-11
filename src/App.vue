<script lang="ts">
import { isLogin, isProfileComplete } from '@/utils/auth';
import { startMatchSocket } from '@/common/matchSocket';

export default {
    onLaunch() {
        console.log('[HotPot] App Launch');
        // 未登录 -> 登录页
        if (!isLogin()) {
            uni.reLaunch({
                url: '/pages/login/login',
            });
            return;
        }
        // 已登录：启动全局 WebSocket 单例，全程接收匹配推送
        startMatchSocket();
        // 已登录但未完善资料 -> 完善资料页
        if (!isProfileComplete()) {
            uni.reLaunch({
                url: '/pages/profile/complete',
            });
        }
    },
    onShow() {
        console.log('[HotPot] App Show');
        // App 回到前台时确保全局连接在线（幂等，已连接则复用）
        if (isLogin()) {
            startMatchSocket();
        }
    },
    onHide() {
        console.log('[HotPot] App Hide');
    },
};
</script>
<style lang="scss">
@import './styles/index.scss';
</style>
