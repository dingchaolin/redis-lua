var ioredis = require('ioredis');
var redisClient;
var fs = require('fs');
redisClient = new ioredis({
    port: 6379,
    host: '127.0.0.1',
    // retry 20 times, total: 102.750 seconds
    maxRetriesPerRequest: 20,
    retryStrategy: function (times) {
        let delay;
        if (times <= 10) {
            // system default retry strategy
            delay = Math.min(times * 50, 2000);
        } else {
            delay = 10000;// 10 seconds
        }

        return delay;
    },
});
console.log('use redis with single point');

redisClient.on('connect', function() {
    console.log('REDIS CONNECTED');
});
redisClient.on('ready', function() {
    console.log('REDIS READY');
});
redisClient.on('error', function(err) {
    console.log('REDIS CONNECTION error ' + err);
    console.log('node error', err.lastNodeError);
});
redisClient.on('close', function() {
    console.log('REDIS CONNECTION CLOSE');
});
redisClient.on('reconnecting', function() {
    console.log('REDIS RECONNECTING');
});
redisClient.on('end', function() {
    console.log('REDIS CONNECTION END');
});

// const readFile = promisify(fs.readFile);

const defineCommand = async () => {
    const luaScriptContentString = `return {KEYS[1], KEYS[2], KEYS[3], ARGV[1], ARGV[2], ARGV[3]}`; //await readFile('./lua/inc.lua', 'utf8');
    redisClient.defineCommand('incSafety', {
        numberOfKeys: 3, // 表示自定义函数的前3个参数是命令
        lua: luaScriptContentString,
    });
}

const exec = async () => {
    await defineCommand();
    const ret = await redisClient.incSafety("KEY1", "KEY2", "KEY3", "ARGV1", "ARGV2", "ARGV3");

    console.log('ret--------------', ret);
}


exec();

