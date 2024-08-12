let apiTag = document.querySelector("#keyinput");
let button2 = apiTag.querySelector("#keyinput button"); // #keyinput 내의 버튼을 선택

button2.addEventListener('click', function(){
  apiTag.style.display = "none";
});

let apiKey = "";

function setApiValue() {
    // input 태그의 값을 가져오기
    const userInputValue = document.getElementById("apiInput").value;
    
    // 가져온 값을 apiKey 변수에 할당
    apiKey = userInputValue;
    
    // 확인을 위해 콘솔에 출력
    console.log("API Key:", apiKey);
  
  }

const endpoint = "https://api.openai.com/v1/chat/completions";
const dalleEndpoint = "https://api.openai.com/v1/images/generations";
let jsonData = null;
let step1, step2, step3, step4;

// GPT API 호출 함수
function callGPT(query, callback) {
    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: query }]
        })
    })
    .then(response => response.json())
    .then(data => {
        try {
            console.log(data); // API 응답 데이터 출력
            const content = data.choices[0].message.content;
            const cleanedContent = content.replace(/\\n/g, ''); // 줄 바꿈을 제거하여 JSON 형식 오류를 방지
            const persona = JSON.parse(cleanedContent);

            // step1, step2, step3, step4 전역 변수에 저장
            ({ step1, step2, step3, step4 } = persona);

            callback(persona); // 다음 작업으로 데이터 전달
        } catch (error) {
            console.error("JSON 파싱 오류:", error, content);
        }
    });
}

// DALL-E API 호출 함수
function callDalle(prompt, callback) {
    fetch(dalleEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            prompt: prompt,
            n: 1,
            size: "256x256"
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('DALL-E API 응답:', data); // 응답 데이터 출력
        if (data && data.data && data.data.length > 0) {
            let imageUrl = data.data[0].url;
            console.log('생성된 이미지 URL:', imageUrl); // 이미지 URL 확인
            callback(imageUrl);
        } else {
            console.error('이미지 URL을 찾을 수 없습니다.');
        }
    })
    .catch(error => {
        console.error("DALL-E API 오류:", error);
    });
}

// 파일 업로드 처리
document.getElementById('uploadButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const checkInput = document.getElementById('checkInput');
    
    if (!file) {
        alert('Please select a file.');
        checkInput.checked = false; // 파일이 없으면 체크박스 비활성화
        checkInput.disabled = true; // 체크박스를 비활성화
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]); // jsonData를 전역 변수에 저장
        
        console.log('파일 업로드 성공:', jsonData); // 콘솔에 업로드 성공 여부 출력
        
        // 파일이 성공적으로 업로드되면 체크박스를 활성화
        checkInput.disabled = false;
        checkInput.checked = true; // 체크박스를 선택된 상태로 설정
        console.log('체크박스 활성화 및 체크 설정 완료');
    };
    
    reader.onerror = function() {
        console.error('파일을 읽는 중 오류가 발생했습니다.');
        checkInput.checked = false;
        checkInput.disabled = true;
    };

    reader.readAsArrayBuffer(file);
});

// 체크박스가 선택되어 있어야만 버튼을 클릭할 수 있게 함
document.getElementById('checkInput').addEventListener('change', function() {
    const button = document.getElementById('toggle-reset-btn'); // 버튼 ID에 맞게 변경
    button.disabled = !this.checked; // 체크박스가 선택되어 있지 않으면 버튼 비활성화
});

// Excel 데이터를 기반으로 쿼리를 생성하는 함수
function generateQueryFromExcelData(data) {
    return `
    이건 내 인터뷰 내용이야: "${JSON.stringify(data)}"
    너는 지금부터 퍼소나를 전문적으로 제작하는 ux리서처야.
    내가 준 내용을 사용해서 퍼소나를 제작해줘.
    이건 퍼소나 제작 단계인데 여기에 맞춰서 제작해줘:
    1. 입력된 인터뷰 내용을 토대로 정책수요자의 행동변수를 작성
    - 활동내역: 그들은 어떤 행동을 하나요?
    - 태도: 그들이 서비스 상황에 어떻게 반응하고 생각하나요?
    - 동기: 그들이 서비스를 이용하는 이유는 무엇인가요?
    2. 인터뷰 참여자와 행동변수 관계를 파악 - 행동 변수 별로 인터뷰 참여자의 위치를 퍼소나 시트에 표기
    3. 같은 그룹에 속한 정책수요자 유형을 찾기 - 각 행동 변수마다 유사한 행동을 보인 수요자들을 분류
    4. 각 퍼소나의 특성 파악 및 목표 설정 - 분류된 퍼소나 그룹에 명칭을 지어주고 각 그룹의 특성, 목표, 문제점을 보여줌
    5. 누락된 정보는 없는지 살펴보세요 - 작성된 각 퍼소나의 특징과 목표 중에 빠진 정보가 없는지 검토하고 중복될 경우 축약함
    6. 퍼소나의 행동 패턴과 주요 특징을 중심으로 상세 설명을 작성 - 4에서 나온 그룹의 특징을 담은 해당 퍼소나만의 스토리를 만들어 자세하게 상세설명을 한다.
    최종적으로 아래와 같은 형식의 하나의 JSON 객체로 전체 퍼소나를 세심하게 생성해줘
    아래의 정보만 서술하기. 만들어보았습니다 등의 추가적인 말은 하지마:
    {
        "step1": {
            "activities": ["활동 1", "활동 2", "활동 3"],
            "attitudes": ["태도 1", "태도 2", "태도 3"],
            "motivations": ["동기 1", "동기 2", "동기 3"]
        },
        "step2": {
            "participant_behavior_relationships": {
                "참여자 1": ["행동변수 1", "행동변수 2"],
                "참여자 2": ["행동변수 1", "행동변수 3"]
            }
        },
        "step3": {
            "grouped_behavior_types": {
                "행동변수 1": ["수요자 1", "수요자 2"],
                "행동변수 2": ["수요자 3", "수요자 4"]
            }
        },
        "step4": {
            "grouped_behavior_characteristic": {
                "그룹1 명칭": ["특성", "목표","문제점"],
                "그룹2 명칭": ["특성", "목표","문제점"]
            }
        },
        "personas": [
            {
                "name": "",
                "age": 0,
                "occupation": "",
                "gender": "",
                "place": "",
                "characteristics": "",
                "current_persona_situation": "",
                "frustration": "",
                "goal": "",
                "motivation": "",
                "needs": "",
                "personality": "",
                "proficiency": "",
                "immersion": ""
            }
        ]
    }
    name은 한국 사람 이름으로 작성, place는 서울, 부산 등 지역 이름으로 작성, personality은 DISC 성격유형인  D주도형 I사교형 C신중형 S안정형에 따라 분류해봤을때 생성된 퍼소나는 중 어디에 해당되는지 1글자만 작성, proficiency은 생성한 페르소나의 숙련도를 입문자 초보자 중급자 전문가 총 4가지로 분류할 수 있을 때 생성된 퍼소나는 어디에 해당되는지 3글자로만 작성, immersion은 생성한 페르소나의 몰입도를 가벼운사용자 평균사용자 몰입사용자 총 3가지로 분류할 수 있을 때 생성된 퍼소나는 어디에 해당되는지 6글자 이내로만 작성
    퍼소나의 갯수는 3개가 넘지 않는 선에서 알맞은 갯수로 작성
    `;
}

// DALL-E 이미지를 생성하고 정보를 업데이트하는 함수
function updateCharacterInfoWithImage(data, id) {
    const prompt = `Create a portrait of a person based on ${data.gender} for gender, ${data.age} for age, ${data.characters} for characteristics. Especially, image the gender accurately. It should depict the entire face`;
    
    callDalle(prompt, function(imageUrl) {
        let personaHTML = `
            <div class="persona" id="persona-${id}">
                <div class="tag-area">
                    <p class="tag">${data.personality} 유형</p> 
                    <p class="tag">${data.proficiency}</p> 
                    <p class="tag">${data.immersion}</p>
                </div>
                <div class="img-area"><img src="${imageUrl}" alt="Persona Image" /></div>
                <div class="persona-info">
                    <p>${data.name} | ${data.age} | ${data.occupation} | ${data.gender} | ${data.place}</p>
                </div>
                <div>
                    <p class="title">특징</p>
                    <p>${data.characteristics}</p>
                </div>
                <div>
                    <p class="title">현재상황</p>
                    <p>${data.current_persona_situation}</p>
                </div>
                <div>
                    <p class="title">불만</p>
                    <p>${data.frustration}</p>
                </div>
                <div>
                    <p class="title">목표</p>
                    <p>${data.goal}</p>
                </div>
                <div>
                    <p class="title">동기</p>
                    <p>${data.motivation}</p>
                </div>
                <div>
                    <p class="title">필요</p>
                    <p>${data.needs}</p>
                </div>
            </div>
            
        `;
        document.getElementById('personas-container').innerHTML += personaHTML;
    });
}

// 이미지를 생성하지 않고 정보를 업데이트하는 함수
function updateCharacterInfo(data, id) {
    const personaHTML = `
        <div class="persona" id="persona-${id}">
            <div class="img-area"></div>
            <div class="persona-info">
                <p>${data.name} | ${data.age} | ${data.occupation} | ${data.gender} | ${data.place}</p>
            </div>
            <div>
                <p class="title">특징</p>
                <p>${data.characteristics}</p>
            </div>
            <div>
                <p class="title">현재상황</p>
                <p>${data.current_persona_situation}</p>
            </div>
            <div>
                <p class="title">불만</p>
                <p>${data.frustration}</p>
            </div>
            <div>
                <p class="title">목표</p>
                <p>${data.goal}</p>
            </div>
            <div>
                <p class="title">동기</p>
                <p>${data.motivation}</p>
            </div>
            <div>
                <p class="title">필요</p>
                <p>${data.needs}</p>
            </div>
        </div>
    `;
    document.getElementById('personas-container').innerHTML += personaHTML;
}

// 퍼소나 생성 버튼 클릭 시 동작
$('#send').click(function() {
    if (!jsonData) {
        alert("파일을 먼저 업로드하세요.");
        return;
    }

    const query = generateQueryFromExcelData(jsonData);
    callGPT(query, function(persona) {
        // 글로 표시할 데이터를 DOM에 추가
        displayTextForStep1(step1);
        displayTextForStep4(step4);

        // 테이블 생성 및 DOM에 추가
        appendTablesToDOM(step2, step3);

        // 각 퍼소나를 HTML로 업데이트
        persona.personas.forEach((personaData, index) => {
            updateCharacterInfoWithImage(personaData, index + 1);  // 이미지를 포함하여 업데이트
        });

        // 팝업창 열기 버튼 표시
        document.getElementById('toggle-process-btn').style.display = 'block';

        // 생성 정보 표시/숨기기 버튼 추가
        addToggleButton();
    });
});

function displayTextForStep1(step1Data) {
    if (!step1Data) return;

    const container = document.getElementById('step1-content');
    container.innerHTML = `
        <h3>Step 1: 행동 변수</h3>
        <p><strong>활동내역:</strong> ${step1Data.activities.join(', ')}</p>
        <p><strong>태도:</strong> ${step1Data.attitudes.join(', ')}</p>
        <p><strong>동기:</strong> ${step1Data.motivations.join(', ')}</p>
    `;
}

function displayTextForStep4(step4Data) {
    if (!step4Data) return;

    const container = document.getElementById('step4-content');
    container.innerHTML = `
        <h3>Step 4: 그룹별 특성 및 목표</h3>
        ${Object.entries(step4Data.grouped_behavior_characteristic).map(([group, details]) => `
            <p><strong>${group}:</strong> 특성 - ${details[0]}, 목표 - ${details[1]}, 문제점 - ${details[2]}</p>
        `).join('')}
    `;
}

function createTable(headers, rows) {
    const table = document.createElement('table');

    const headerRow = table.insertRow();
    headers.forEach(header => {
        const cell = headerRow.insertCell();
        cell.innerHTML = header;
    });

    rows.forEach(rowData => {
        const row = table.insertRow();
        rowData.forEach(cellData => {
            const cell = row.insertCell();
            cell.innerHTML = cellData || '';
        });
    });

    return table;
}

function createTableForStep2(step2Data) {
    if (!step2Data) return null;

    const participants = Object.keys(step2Data.participant_behavior_relationships);
    const behaviors = [];

    participants.forEach(participant => {
        step2Data.participant_behavior_relationships[participant].forEach(behavior => {
            if (!behaviors.includes(behavior)) behaviors.push(behavior);
        });
    });

    const headers = ['행동변수', ...participants];
    const rows = behaviors.map(behavior => [
        behavior,
        ...participants.map(participant =>
            step2Data.participant_behavior_relationships[participant].includes(behavior) ? 'O' : ''
        )
    ]);

    return createTable(headers, rows);
}

function createTableForStep3(step3Data) {
    if (!step3Data) return null;

    const headers = ['행동변수', '수요자'];
    const rows = Object.entries(step3Data.grouped_behavior_types).map(([behavior, types]) => [
        behavior, types.join(', ')
    ]);

    return createTable(headers, rows);
}

function appendTablesToDOM(step2Data, step3Data) {
    const container = document.getElementById('step-popup');

    const table2 = createTableForStep2(step2Data);
    if (table2) {
        const step2Container = document.getElementById('step2-content');
        step2Container.appendChild(table2);
    }

    const table3 = createTableForStep3(step3Data);
    if (table3) {
        const step3Container = document.getElementById('step3-content');
        step3Container.appendChild(table3);
    }
}

function addToggleButton() {
    const button = document.createElement('button');
    button.textContent = '생성 과정 확인하기';
    button.onclick = () => {
        const stepContent = document.querySelectorAll('.step-content');
        stepContent.forEach(content => {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
    };
    document.body.appendChild(button);
}

document.getElementById('toggle-process-btn').addEventListener('click', function() {
    document.getElementById('step-popup').style.display = 'block';
});

document.getElementById('close-popup').addEventListener('click', function() {
    document.getElementById('step-popup').style.display = 'none';
});

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const stepContent = document.querySelectorAll('.step-content');
        stepContent.forEach(content => content.classList.remove('active'));

        const stepId = this.getAttribute('data-step');
        const targetContent = document.getElementById(`${stepId}-content`);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
    });
});

function exportPersonasToFile(personas) {
    const dataStr = JSON.stringify(personas, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'personas.json';
    a.click();

    URL.revokeObjectURL(url); // 메모리 해제
}

$('#toggle-reset-btn').click(function() {
    // 1. 기존 퍼소나 카드 삭제
    $('#personas-container').empty();

    // 2. 새로운 퍼소나 카드 생성 (send 버튼의 기능과 동일)
    if (!jsonData) {
        alert("파일을 먼저 업로드하세요.");
        return;
    }

    const query = generateQueryFromExcelData(jsonData);
    callGPT(query, function(persona) {
        // 글로 표시할 데이터를 DOM에 추가
        displayTextForStep1(step1);
        displayTextForStep4(step4);

        // 테이블 생성 및 DOM에 추가
        appendTablesToDOM(step2, step3);

        // 각 퍼소나를 HTML로 업데이트
        persona.personas.forEach((personaData, index) => {
            updateCharacterInfoWithImage(personaData, index + 1);
        });

        // 팝업창 열기 버튼 표시
        document.getElementById('toggle-process-btn').style.display = 'block';

        // 생성 정보 표시/숨기기 버튼 추가
        addToggleButton();
    });
});