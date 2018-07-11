const ipcRenderer =require('electron').ipcRenderer;
const Fcoin = require("../modules/Fcoin");
//ipcRenderer.send('message','ping')//发送异步消息，sendSync()异步

// ipcRenderer.on('reply',function(event, arg) {
//     console.log(arg);// prints "pong"});//监听reply

// });

// ipcRenderer.on("channel", (rs) => {
//     console.log(rs);
// });
const data = {
    key: "8cab04537f9c45f2a529360a2324bc3d",
    secret: "b992cf90345345059f09d0e2e8908a44"
};

let fcoin = new Fcoin(data);

let balIntervalID = undefined;
let marketPriceIntervalID = undefined;
let orderIntervalID = undefined;

let orderIDs = [];

Array.prototype.remove = (val) => {
    let index  = this.indexOf(val);
    if(index > -1) {
        this.splice(index, 1);
    }
};


let timeoutTrade = (fetchPromise, timeout) => {
    let abort = null;

    let abortPromise = (resolve, reject) => {
        abort = () => {
            reject("超时，撤单");
        }
    };

    let abortablePromise = Promise.race([
        fetchPromise,
        abortPromise
    ]);

    setTimeout(abort, timeout * 1000);

};

// set balance html
let setRelatedBal = (data, cur1, cur2) => {
    let temp = "<tr><th>币种</th><th>可用资产</th><th>冻结资产</th></tr>";					
    data.map((o) => {
        console.log(o.currency + ", " + cur1 + ", " + cur2);
        if(o.currency === cur1 || o.currency === cur2) {
            temp = `${temp}<tr><td>${o.currency}</td><td>${o.available}</td><td>${o.frozen}</td>`
        }
    });
    $(".select-symbol-info table").html(temp);
}

//get balance value
let getBal = (cur1, cur2) => {
    return () => {
        fcoin.getBalance().then((res) => {
            setRelatedBal(res.data, cur1, cur2);
        });
    }
  
}


// set market price html
let setMarketPrice = (data) => {
    let tempBuy = "<tr><th>买单</th><th>价格</th><th>数量</th></tr>";
    let tempSell = "<tr><th>卖单</th><th>价格</th><th>数量</th></tr>";

    let bids = data.bids;
    let asks = data.asks;
    for(let i = 0; i < bids.length; i++) {
        tempBuy = `${tempBuy}<tr><td>买${i+1}</td><td>${bids[i]}</td><td>${bids[i+1]}</td></tr>`
    }
    for(let i = 0; i < asks.length; i++) {
        tempSell = `${tempBuy}<tr><td>卖${i+1}</td><td>${asks[i]}</td><td>${asks[i+1]}</td></tr>`
    }
    
    $(".market-price .buy").html(tempBuy);
    $(".market-price .sell").html(tempSell);
}

//get markt price
var getMarketPrice = (symbol) => {
    return () => {
        fcoin.getDepth("L20", symbol).then((res) => {
            console.log(res);
            let data = res.data;
            setMarketPrice(data);
        });
    }
    
}




//获取交易对
fcoin.getSymbols().then((res) => {
    let symbols = "";
    let data = res.data;
    data.map((symbol) => {
        symbols = `${symbols}<option>${symbol.base_currency}-${symbol.quote_currency}</option>`;
    });
    $(".select-symbol-info select").html(symbols);
   // console.log(res);
    balIntervalID = setInterval(getBal(data[0].base_currency, data[0].quote_currency), 1000);
    marketPriceIntervalID = setInterval(getMarketPrice(`${data[0].base_currency}${data[0].quote_currency}`), 1000);
    
});

let createOrder = (symbol, side, type, orderCnt, orderTimeOut) => {
    return () => {
        let price = 123;
        let amount = 123;
        let curDate = new Date().getTime();

        let abort = null;

        let fetchPromise = fcoin.createOrder(symbol, side, type, price, amount).then((rs) => {
            if(rs.hasOwnProperty("data")) {
                orderIDs.push(rs.data);
            } 
        }).catch(function (reason) {
            console.log('失败：' + reason);
        });

     
        timeoutTrade(fetchPromise, orderTimeOut);
    };
}

let cancelOrder = (id) => {
    return () => {
        fcoin.cancelOrder(id).then((rs) => {
            if(rs.hasOwnProperty("data")) {
                orderIDs.remove(rs.data);
            } 
        });
    }
}

let startTrade = () => {
    let orderRate = $("#order-rate").val();
    let orderCnt = $("order-cnt").val();
    let orderTimeOut = $("order-time-out").val();

    let val = $(".select-symbol-info select").val();
    let cur1 = val.substring(0, val.indexOf("-"));
    let cur2 = val.substring(val.indexOf("-") + 1, val.length);
    
    if(orderIntervalID) clearInterval(orderIntervalID);

    orderIntervalID = setInterval(createOrder(`${cur1}${cur2}`, "buy", "limit" , orderCnt, orderTimeOut), orderRate * 1000);
    
}





$(".select-symbol-info select").on("change", (e) => {
    let val = $(".select-symbol-info select").val();
    let cur1 = val.substring(0, val.indexOf("-"));
    let cur2 = val.substring(val.indexOf("-") + 1, val.length);

    
    if(balIntervalID) clearInterval(balIntervalID);
    if(marketPriceIntervalID) clearInterval(marketPriceIntervalID);
    balIntervalID = setInterval(getBal(cur1, cur2) , 1000);
    marketPriceIntervalID = setInterval(getMarketPrice(`${cur1}${cur2}`) , 1000);
});

// var a = setInterval(()=>{return null;}, 500)
// clearInterval()
