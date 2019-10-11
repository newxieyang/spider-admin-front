let dateUtil = {

};

dateUtil.transDate =  function (dateMills) {
    let date = new Date(parseInt(dateMills));//转换成中国标准时间:Mon Dec 10 2018 00:00:00 GMT+0800 (中国标准时间)
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
};


dateUtil.transDateTime =  function (dateMills) {
    let date = new Date(parseInt(dateMills));//转换成中国标准时间:Mon Dec 10 2018 00:00:00 GMT+0800 (中国标准时间)
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' +
        date.getHours() +  ':' +  date.getMinutes() + ":" + date.getSeconds();
};


export default dateUtil;
