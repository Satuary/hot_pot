<script lang="ts">
import { isLogin, isProfileComplete, setUserInfo } from '@/utils/auth';
import { startMatchSocket } from '@/common/matchSocket';
import { getUserInfo } from '@/api/api';

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
        // 已登录：请求一次最新用户信息更新本地缓存，确保头像等资料是最新的
        refreshUserInfo();
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

// 请求最新用户信息并同步到本地缓存
async function refreshUserInfo() {
    try {
        const userInfo = await getUserInfo();
        if (userInfo) {
            setUserInfo(userInfo);
        }
    } catch (e) {
        // 获取失败不阻塞启动，继续使用旧缓存
        console.warn('[HotPot] 刷新用户信息失败，使用本地缓存', e);
    }
}
</script>
<style lang="scss">
@import './styles/index.scss';
</style>
