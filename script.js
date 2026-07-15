const loadBtn = document.getElementById("loadBtn");
const cyclesDiv = document.getElementById("cycles");
const detailsDiv = document.getElementById("details");


loadBtn.onclick = async function () {

    let url = document.getElementById("nsUrl").value.trim();
    let secret = document.getElementById("apiSecret").value.trim();

    if (!url) {
        alert("Введите URL Nightscout");
        return;
    }

    url = url.replace(/\/$/, "");

    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;

    const api =
        `${url}/api/v1/devicestatus.json?count=100`;

    try {

        const response = await fetch(api, {
            headers: {
                "api-secret": secret
            }
        });

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
            <b>${new Date(item.created_at).toLocaleString()}</b><br>
            ГК: ${s.bg ?? "-"} |
            IOB: ${s.iob ?? "-"} |
            COB: ${s.cob ?? "-"}<br>
            SMB: ${s.smb ?? 0} |
            ВБС: ${s.rate ?? "-"} Ед/ч
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


    detailsDiv.innerHTML = `

<div class="row">
<span class="name">Время:</span>
${new Date(item.created_at).toLocaleString()}
</div>


<div class="row">
<span class="name">Глюкоза:</span>
${s.bg ?? "-"} ммоль/л
</div>


<div class="row">
<span class="name">IOB:</span>
${s.iob ?? "-"} Ед
</div>


<div class="row">
<span class="name">COB:</span>
${s.cob ?? "-"} г
</div>


<div class="row">
<span class="name">insulinReq:</span>
${s.insulinReq ?? "-"} Ед
</div>


<div class="row">
<span class="name">microBolusAllowed:</span>
${s.microBolusAllowed ?? "-"}
</div>


<div class="row">
<span class="name">maxBolus:</span>
${s.maxBolus ?? "-"} Ед
</div>


<div class="row">
<span class="name">SMB:</span>
${s.smb ?? 0} Ед
</div>


<div class="row">
<span class="name">ВБС rate:</span>
${s.rate ?? "-"} Ед/ч
</div>


<div class="row">
<span class="name">Время ВБС:</span>
${s.duration ?? "-"} мин
</div>


<div class="row">
<span class="name">Причина:</span>
${s.reason ?? "-"}
</div>


<hr>

<details>
<summary>Исходный JSON</summary>
<pre>${JSON.stringify(s,null,2)}</pre>
</details>

`;

}
