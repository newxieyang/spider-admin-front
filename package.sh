#! /bin/bash

target_file="/Users/cullen/Downloads/tatu.images.tar"
source_dir="/Users/cullen/git/spider-admin-front"

echo '打包项目 --- start。。。'
# 打开项目所在目录
cd ${source_dir}

# 根目录下进行 install
cnpm run build

docker build -t tatu .


echo '打包项目结束 开始导出镜像 。。。。'

if [[ -f ${target_file} ]];then
    echo "文件存在^_^,  删除文件"
    rm -f ${target_file}
fi

#docker save -o ${target_file} tatu


# run docker -p: 指定端口映射，格式为：主机(宿主)端口:容器端口
docker run -p 80:80 --name tatu -d tatu
