<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
onLaunch(() => {
    console.log('[HotPot] App Launch');
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
