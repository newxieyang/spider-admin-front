import { getSex } from '@/api/index';

let dictUtil = {

};

// 获取常用的数据字典保存至vuex
dictUtil.initDictData = function (vm) {

    getSex().then(res => {
        if(res.success){
            vm.$store.commit("setSex", res.result);
        }
    })
};

export default dictUtil;
