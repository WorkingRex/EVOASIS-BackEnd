移至專案路徑：
```bash
$ cd /home/ec2-user/EVOASIS/
```

git clone 
```bash
$ git clone https://github.com/sj-EVOASIS/EVOASIS-BackEnd.git
```

### PM2

With NPM:

```bash
$ npm install -g pm2
```

移置後端專案下
```bash
$ cd EVOASIS-BackEnd/
```

Start an application
```bash
$ pm2 start app.js
```

List all running applications
```bash
$ pm2 list
```

Delete an application
```bash
pm2 delete 0
```

重啟 PM2
```
$ cd /home/ec2-user/EVOASIS/EVOASIS-BackEnd
$ pm2 list
$ pm2 delete 0
$ pm2 start app.js
```