// Prediction OneのAPI作成画面で表示されるAPI URLとAPI Keyを設定する
const PREDICTION_ONE_KEY = "09f2987e-2a22-4fd9-8cb0-aff042f5cc17";
const PREDICTION_ONE_URL = "https://user-api.predictionone.sony.biz/v1/groups/pdm9airlpozx6k24/classifiers/qgj3hwgalm9d0wz7/inference";

// APIが受け付けているデータ形式に変換する
function b64Decode(str) {
    const encodedURI = atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')
    const result = decodeURIComponent(encodedURI);
    return result;
}
function b64Encode(str) {
    const stringToEncode = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    })
    const result = btoa(stringToEncode);
    return result;
}
// APIにデータを送信する
async function postData(url = '', data = {}, key ) {
    
    hoge = await fetch(url, {
        method: 'POST',
        mode: 'cors', 
        headers: {
            'Content-Type': 'application/json',
            "x-api-key": key,
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
    .then(data => {
        return  b64Decode( data.outputs[0].data) 
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    return hoge;
}

async function predict(pred_data, preidcion_one_url, key  ){

    const url = preidcion_one_url;
    // APIへの送信内容を整える
    const data = 
            {"inputs":
                [
                    {"name":"pr","type":"csv","data": b64Encode(pred_data)},
                    {"name":"ar","type":"boolean","data":true},
                    {"name":"ad","type":"boolean","data":false},
                    {"name":"nc","type":"boolean","data":true}]
                }
        return await postData(url,data,key);
}

// 送信ボタンが押された時の処理
submit = async function(){
    document.querySelector("#result").innerText = "予測中";
    document.querySelector( "#submit" ).disabled = true;
    document.querySelector("#result").className ="";
    document.querySelector("#resultsec").innerText = "予測中";
    document.querySelector( "#submit" ).disabled = true;
    document.querySelector("#resultsec").className ="";
    document.querySelector("#resultth").innerText = "予測中";
    document.querySelector( "#submit" ).disabled = true;
    document.querySelector("#resultth").className ="";
    
    const selects = document.querySelectorAll("select");
    const data = [ [],[] ];
    selects.forEach( elm =>{
        data[ 0 ].push( elm.name );
        data[ 1 ].push(elm.value);
    } );
    const data_str = data[0].join(",") + "\n" + data[1].join(",");
    const result = await predict( data_str, PREDICTION_ONE_URL, PREDICTION_ONE_KEY ) ;

    const names =  result.split("\n")[0].split(",");
    names.shift()
    const scores = result.split("\n")[1].split(",");
    scores.shift()

    for (let i=0; i<scores.length-1; i++){
        for(let j=0; j<scores.length-i; j++){
            if(scores[j]<scores[j+1]){
                var ntmp=scores[j];
                scores[j]=scores[j+1];
                scores[j+1]=ntmp;

                var mtmp=names[j];
                names[j]=names[j+1];
                names[j+1]=mtmp;
            }
        }
    }
   
    console.log(names)
    console.log(scores)
    console.log(names[0])
    document.querySelector("#result").innerText = names[0]+"\nおすすめ度 " + Math.round(scores[0]*100) + "%";
    document.querySelector("#resultsec").innerText = names[1]+"\nおすすめ度 " + Math.round(scores[1]*100) + "%";
    document.querySelector("#resultth").innerText = names[2]+"\nおすすめ度 " + Math.round(scores[2]*100) + "%";
    document.querySelector( "#submit" ).disabled = false;
}