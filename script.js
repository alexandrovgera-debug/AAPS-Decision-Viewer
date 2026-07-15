const loadBtn = document.getElementById("loadBtn");
const cyclesDiv = document.getElementById("cycles");
const detailsDiv = document.getElementById("details");

function getCOB(s) {

    if (s.cob !== undefined) {
        return s.cob;
    }

    if (s.reason) {
        const match = s.reason.match(/COB:\s*([\d.,]+)/);

        if (match) {
            return match[1];
        }
    }

    return "-";
}

loadBtn.onclick = async function () {

    let url = document.getElementById("nsUrl").value.trim();
    let secret = "";

    if (!url) {
        alert("Введите URL Nightscout");
        return;
    }

    url = url.replace(/\/$/, "");

    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;

    const api =
        `${url}/api/v1/devicestatus.json?count=100`;

    try {

        const response = await fetch(api);

        const data = await response.json();


        const filtered = data.filter(item => {
            return new Date(item.created_at).getTime() >= sixHoursAgo
                && item.openaps
                && item.openaps.suggested;
        });


        if (filtered.length === 0) {
            cyclesDiv.innerHTML =
                "За последние 6 часов решений AAPS не найдено";
            return;
        }


        cyclesDiv.innerHTML = "";


        filtered.reverse().forEach((item,index)=>{


            const s = item.openaps.suggested;


            const div = document.createElement("div");

            div.className = "cycle";
            
            div.innerHTML = `
            <b>${new Date(item.created_at).toLocaleString()}</b>
            <br>
            <div>ГК: ${s.bg ? (s.bg / 18).toFixed(1) : "-"} ммоль/л</div>
            <div>IOB: ${item.openaps.iob?.iob ?? "-"} Ед</div>
            <div>COB: ${getCOB(s)} г</div>
            <br>
            <div>SMB: ${s.smb ?? 0} Ед</div>
            <div>ВБС: ${s.rate ?? "-"} Ед/ч</div>
            `;
            
            div.onclick = function(){
                showDetails(item);
            };


            cyclesDiv.appendChild(div);

        });


    }
    catch(error){

        cyclesDiv.innerHTML =
        "Ошибка загрузки: " + error;

    }

};


function showDetails(item){

    const s = item.openaps.suggested;

    const bg = s.bg ? (Number(s.bg) / 18).toFixed(1) : "-";

    detailsDiv.innerHTML = `

<h3>Решение AAPS</h3>

<div class="row">
<span class="name">Время:</span>
${new Date(item.created_at).toLocaleString()}
</div>


<div class="row">
<span class="name">Глюкоза:</span>
${bg} ммоль/л
</div>


<div class="row">
<span class="name">IOB:</span>
${s.iob ?? item.openaps.iob?.iob ?? "-"} Ед
</div>


<div class="row">
<span class="name">COB:</span>
${getCOB(s)} г
</div>


<hr>


<h3>Расчёт инсулина</h3>


<div class="row">
<span class="name">insulinReq:</span>
${s.insulinReq ?? "-"} Ед
</div>


<div class="row">
<span class="name">Разрешение SMB:</span>
${s.microBolusAllowed === true ? "ДА" : "НЕТ"}
</div>


<div class="row">
<span class="name">Максимальный SMB:</span>
${s.maxBolus ?? "-"} Ед
</div>


<div class="row">
<span class="name">Выданный SMB:</span>
${s.smb ?? 0} Ед
</div>


<hr>


<h3>Временная базальная скорость</h3>


<div class="row">
<span class="name">Скорость:</span>
${s.rate ?? "-"} Ед/ч
</div>


<div class="row">
<span class="name">Длительность:</span>
${s.duration ?? "-"} мин
</div>


<hr>


<h3>Прогноз</h3>


<div class="row">
<span class="name">eventualBG:</span>
${s.eventualBG ? (s.eventualBG / 18).toFixed(1) : "-"} ммоль/л
</div>


<div class="row">
<span class="name">targetBG:</span>
${s.targetBG ? (s.targetBG / 18).toFixed(1) : "-"} ммоль/л
</div>


<hr>


<h3>Почему принято такое решение</h3>

<div>
${s.reason ?? "-"}
</div>


<hr>


<details>
<summary>Полный JSON</summary>
<pre>${JSON.stringify(s,null,2)}</pre>
</details>

`;

}
