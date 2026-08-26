/* =====================================================
   BLUE RETREAT APP
===================================================== */

let currentVoter = null;

let currentType = null;

let voteStatus = {

    male: false,

    female: false

};

let reportAuthenticated = false;


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
    'DOMContentLoaded',
    initialize
);


async function initialize() {

    try {

        showLoading();


        const system =
            await api({

                action:
                    'getSystem'

            });


        if (!system.success) {

            throw new Error(
                system.message
            );

        }


        await loadGroups();

        updateCandidatePreview();


    } catch (error) {

        console.error(error);


        showModal(

            'ไม่สามารถเชื่อมต่อระบบ',

            error.message,

            '⚠️'

        );

    } finally {

        hideLoading();

    }

}


/* =====================================================
   PAGE
===================================================== */

function showPage(
    page
) {

    document
        .querySelectorAll(
            '.page'
        )
        .forEach(
            element => {

                element.classList.add(
                    'hidden'
                );

            }
        );


    const target =
        document.getElementById(
            `page-${page}`
        );


    if (target) {

        target.classList.remove(
            'hidden'
        );

    }


    document
        .querySelectorAll(
            '.nav-btn'
        )
        .forEach(
            button => {

                button.classList.remove(
                    'active'
                );


                if (
                    button.dataset.page ===
                    page
                ) {

                    button.classList.add(
                        'active'
                    );

                }

            }
        );


    if (
        page === 'vote' &&
        !currentVoter
    ) {

        resetVotePage();

    }


    if (
        page === 'report' &&
        !reportAuthenticated
    ) {

        document
            .getElementById(
                'reportLogin'
            )
            .classList.remove(
                'hidden'
            );


        document
            .getElementById(
                'reportArea'
            )
            .classList.add(
                'hidden'
            );

    }


    window.scrollTo({

        top: 0,

        behavior: 'smooth'

    });

}


/* =====================================================
   CANDIDATE PREVIEW
===================================================== */

document
    .getElementById(
        'registerType'
    )
    .addEventListener(
        'change',
        updateCandidatePreview
    );


function updateCandidatePreview() {

    const type =
        document
            .getElementById(
                'registerType'
            )
            .value;


    const preview =
        document
            .getElementById(
                'candidateIdPreview'
            );


    preview.textContent =

        type === 'หญิง'

            ? 'W-LKA-0001'

            : 'M-LKA-0001';

}


/* =====================================================
   LOAD GROUPS
===================================================== */

async function loadGroups() {

    const select =
        document.getElementById(
            'groupSelect'
        );


    const result =
        await api({

            action:
                'getGroups'

        });


    if (!result.success) {

        throw new Error(
            result.message
        );

    }


    select.innerHTML = `

        <option value="">

            -- เลือกกลุ่มสาระฯ / แผนงาน --

        </option>

    `;


    result.groups.forEach(
        group => {

            const option =
                document.createElement(
                    'option'
                );


            option.value =
                group.id;


            option.textContent =
                group.name;


            select.appendChild(
                option
            );

        }
    );

}


/* =====================================================
   GROUP CHANGE
===================================================== */

document
    .getElementById(
        'groupSelect'
    )
    .addEventListener(
        'change',
        loadVoters
    );


async function loadVoters() {

    const groupId =
        document
            .getElementById(
                'groupSelect'
            )
            .value;


    const voterStep =
        document.getElementById(
            'voterStep'
        );


    const voterSelect =
        document.getElementById(
            'voterSelect'
        );


    if (!groupId) {

        voterStep.classList.add(
            'hidden'
        );

        return;

    }


    try {

        showLoading();


        const result =
            await api({

                action:
                    'getVoters',

                groupId:
                    groupId

            });


        if (!result.success) {

            throw new Error(
                result.message
            );

        }


        voterSelect.innerHTML = `

            <option value="">

                -- เลือกผู้มีสิทธิ์ --

            </option>

        `;


        result.voters.forEach(
            voter => {

                const option =
                    document.createElement(
                        'option'
                    );


                option.value =
                    voter.id;


                option.textContent =
                    `${voter.id} | ${voter.fullName}`;


                voterSelect.appendChild(
                    option
                );

            }
        );


        voterStep.classList.remove(
            'hidden'
        );


    } catch (error) {

        showModal(

            'เกิดข้อผิดพลาด',

            error.message,

            '⚠️'

        );

    } finally {

        hideLoading();

    }

}


/* =====================================================
   LOGIN
===================================================== */

document
    .getElementById(
        'loginButton'
    )
    .addEventListener(
        'click',
        login
    );


async function login() {

    const voterId =
        document
            .getElementById(
                'voterSelect'
            )
            .value;


    if (!voterId) {

        showModal(

            'กรุณาเลือกผู้มีสิทธิ์',

            'กรุณาเลือกชื่อ-นามสกุลก่อน',

            '⚠️'

        );

        return;

    }


    try {

        showLoading();


        const result =
            await api({

                action:
                    'login',

                voterId:
                    voterId

            });


        if (!result.success) {

            throw new Error(
                result.message
            );

        }


        currentVoter =
            result.voter;


        document
            .getElementById(
                'voterName'
            )
            .textContent =
            `${currentVoter.id} | ${currentVoter.fullName}`;


        document
            .getElementById(
                'voterGroup'
            )
            .textContent =
            `กลุ่ม: ${currentVoter.group}`;


        document
            .getElementById(
                'voteGroupStep'
            )
            .classList.add(
                'hidden'
            );


        document
            .getElementById(
                'voterStep'
            )
            .classList.add(
                'hidden'
            );


        document
            .getElementById(
                'votingArea'
            )
            .classList.remove(
                'hidden'
            );


        await loadVoteStatus();


    } catch (error) {

        showModal(

            'เข้าสู่ระบบไม่ได้',

            error.message,

            '⚠️'

        );

    } finally {

        hideLoading();

    }

}


/* =====================================================
   VOTE STATUS
===================================================== */

async function loadVoteStatus() {

    const result =
        await api({

            action:
                'getVoteStatus',

            voterId:
                currentVoter.id

        });


    if (!result.success) {

        throw new Error(
            result.message
        );

    }


    voteStatus.male =
        result.male;


    voteStatus.female =
        result.female;


    updateStatusUI();

}


/* =====================================================
   STATUS UI
===================================================== */

function updateStatusUI() {

    const male =
        document.getElementById(
            'maleStatus'
        );


    const female =
        document.getElementById(
            'femaleStatus'
        );


    male.querySelector(
        'small'
    ).textContent =

        voteStatus.male

            ? '✓ ใช้สิทธิ์แล้ว'

            : 'ยังไม่ได้ใช้สิทธิ์';


    female.querySelector(
        'small'
    ).textContent =

        voteStatus.female

            ? '✓ ใช้สิทธิ์แล้ว'

            : 'ยังไม่ได้ใช้สิทธิ์';


    male.style.background =

        voteStatus.male

            ? '#e5f8ec'

            : '#f5faf9';


    female.style.background =

        voteStatus.female

            ? '#e5f8ec'

            : '#f5faf9';

}


/* =====================================================
   OPEN CANDIDATES
===================================================== */

async function openCandidates(
    type
) {

    currentType =
        type;


    if (
        type === 'ชาย' &&
        voteStatus.male
    ) {

        showModal(

            'ใช้สิทธิ์แล้ว',

            'คุณได้ใช้สิทธิ์โหวตฝ่ายชายไปแล้ว',

            '🔒'

        );

        return;

    }


    if (
        type === 'หญิง' &&
        voteStatus.female
    ) {

        showModal(

            'ใช้สิทธิ์แล้ว',

            'คุณได้ใช้สิทธิ์โหวตฝ่ายหญิงไปแล้ว',

            '🔒'

        );

        return;

    }


    try {

        showLoading();


        const result =
            await api({

                action:
                    'getCandidates',

                type:
                    type

            });


        if (!result.success) {

            throw new Error(
                result.message
            );

        }


        document
            .getElementById(
                'typeSelection'
            )
            .classList.add(
                'hidden'
            );


        document
            .getElementById(
                'candidateSection'
            )
            .classList.remove(
                'hidden'
            );


        document
            .getElementById(
                'candidateTypeLabel'
            )
            .textContent =
            `ประเภท${type}`;


        renderCandidates(
            result.candidates
        );


    } catch (error) {

        showModal(

            'เกิดข้อผิดพลาด',

            error.message,

            '⚠️'

        );

    } finally {

        hideLoading();

    }

}


/* =====================================================
   RENDER CANDIDATES
===================================================== */

function renderCandidates(
    candidates
) {

    const grid =
        document.getElementById(
            'candidateGrid'
        );


    grid.innerHTML =
        '';


    if (
        !candidates ||
        candidates.length === 0
    ) {

        grid.innerHTML = `

            <div
                style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:40px;
                "
            >

                <div
                    style="
                        font-size:60px;
                    "
                >
                    😔
                </div>

                <h3>
                    ยังไม่มีผู้เข้าประกวด
                </h3>

            </div>

        `;

        return;

    }


    candidates.forEach(
        candidate => {

            const card =
                document.createElement(
                    'div'
                );


            card.className =
                'candidate';


            const displayName =
                `${candidate.id} | ${candidate.nickname}`;


            card.innerHTML = `

                <div
                    class="candidate-avatar"
                >

                    ${
                        candidate.type ===
                        'ชาย'
                            ? '👨'
                            : '👩'
                    }

                </div>


                <div
                    class="candidate-name"
                >

                    ${escapeHtml(
                        displayName
                    )}

                </div>


                <button
                    class="vote-btn"
                >

                    ⭐ โหวต

                </button>

            `;


            card
                .querySelector(
                    '.vote-btn'
                )
                .addEventListener(
                    'click',
                    () => {

                        confirmVote(

                            candidate.id,

                            candidate.nickname

                        );

                    }
                );


            grid.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   CONFIRM VOTE
===================================================== */

function confirmVote(
    candidateId,
    nickname
) {

    showModal(

        'ยืนยันการโหวต',

        `

            คุณต้องการโหวตให้

            <br><br>

            <strong
                style="
                    font-size:25px;
                    color:#087c96;
                "
            >

                ${escapeHtml(
                    candidateId
                )}

                |

                ${escapeHtml(
                    nickname
                )}

            </strong>

            <br><br>

            ⚠️ เมื่อยืนยันแล้ว
            จะไม่สามารถเปลี่ยนคะแนนได้

        `,

        '⭐',

        true,

        () => {

            submitVote(
                candidateId
            );

        }

    );

}


/* =====================================================
   SUBMIT VOTE
===================================================== */

async function submitVote(
    candidateId
) {

    closeModal();


    try {

        showLoading();


        const result =
            await api({

                action:
                    'submitVote',

                voterId:
                    currentVoter.id,

                type:
                    currentType,

                candidateId:
                    candidateId

            });


        if (!result.success) {

            showModal(

                result.duplicate
                    ? 'ใช้สิทธิ์แล้ว'
                    : 'บันทึกคะแนนไม่ได้',

                result.message,

                result.duplicate
                    ? '🔒'
                    : '⚠️'

            );


            await loadVoteStatus();

            return;

        }


        if (
            currentType === 'ชาย'
        ) {

            voteStatus.male =
                true;

        } else {

            voteStatus.female =
                true;

        }


        updateStatusUI();


        document
            .getElementById(
                'candidateSection'
            )
            .classList.add(
                'hidden'
            );


        document
            .getElementById(
                'typeSelection'
            )
            .classList.remove(
                'hidden'
            );


        showModal(

            'โหวตสำเร็จ',

            `

                🎉 บันทึกคะแนนเรียบร้อยแล้ว

                <br><br>

                ขอบคุณสำหรับการร่วมโหวต

            `,

            '✓'

        );


    } catch (error) {

        showModal(

            'เกิดข้อผิดพลาด',

            error.message,

            '⚠️'

        );

    } finally {

        hideLoading();

    }

}


/* =====================================================
   BACK
===================================================== */

function backToType() {

    document
        .getElementById(
            'candidateSection'
        )
        .classList.add(
            'hidden'
        );


    document
        .getElementById(
            'typeSelection'
        )
        .classList.remove(
            'hidden'
        );

}


/* =====================================================
   REGISTER CANDIDATE
===================================================== */

async function registerCandidate() {

    const type =
        document
            .getElementById(
                'registerType'
            )
            .value;


    const nickname =
        document
            .getElementById(
                'registerNickname'
            )
            .value
            .trim();


    if (!type) {

        showModal(

            'กรุณาเลือกประเภท',

            'กรุณาเลือกประเภทชายหรือหญิง',

            '⚠️'

        );

        return;

    }


    if (!nickname) {

        showModal(

            'กรุณากรอกชื่อเล่น',

            'กรุณากรอกชื่อเล่นก่อนลงทะเบียน',

            '⚠️'

        );

        return;

    }


    try {

        showLoading();


        const result =
            await api({

                action:
                    'registerCandidate',

                type:
                    type,

                nickname:
                    nickname

            });


        if (!result.success) {

            throw new Error(
                result.message
            );

        }


        document
            .getElementById(
                'registerType'
            )
            .value =
            '';


        document
            .getElementById(
                'registerNickname'
            )
            .value =
            '';


        updateCandidatePreview();


        showModal(

            'ลงทะเบียนสำเร็จ',

            `

                🎉 ลงทะเบียนเรียบร้อยแล้ว

                <br><br>

                รหัสผู้สมัคร

                <div
                    style="
                        margin:15px 0;
                        padding:12px;
                        border-radius:15px;
                        background:#fff5bf;
                        color:#625300;
                        font-size:30px;
                        font-weight:800;
                    "
                >

                    ${escapeHtml(
                        result.candidateId
                    )}

                </div>


                <strong
                    style="
                        font-size:24px;
                    "
                >

                    ${escapeHtml(
                        result.nickname
                    )}

                </strong>

            `,

            '🏆'

        );


    } catch (error) {

        showModal(

            'ลงทะเบียนไม่ได้',

            error.message,

            '⚠️'

        );

    } finally {

        hideLoading();

    }

}


/* =====================================================
   REPORT LOGIN
===================================================== */

async function loadReport() {

    const password =
        document
            .getElementById(
                'adminPassword'
            )
            .value
            .trim();


    if (!password) {

        showModal(

            'กรุณากรอกรหัสผ่าน',

            'กรุณากรอกรหัสผ่านผู้ดูแลระบบ',

            '🔐'

        );

        return;

    }


    try {

        showLoading();


        const result =
            await api({

                action:
                    'getReport',

                password:
                    password

            });


        if (!result.success) {

            throw new Error(
                result.message
            );

        }


        reportAuthenticated =
            true;


        document
            .getElementById(
                'reportLogin'
            )
            .classList.add(
                'hidden'
            );


        document
            .getElementById(
                'reportArea'
            )
            .classList.remove(
                'hidden'
            );


        renderReport(
            result
        );


        document
            .getElementById(
                'adminPassword'
            )
            .value =
            '';


    } catch (error) {

        showModal(

            'เข้าดูรายงานไม่ได้',

            error.message,

            '🔐'

        );

    } finally {

        hideLoading();

    }

}


/* =====================================================
   RENDER REPORT
===================================================== */

function renderReport(
    data
) {

    document
        .getElementById(
            'totalVotes'
        )
        .textContent =
        data.totalVotes;


    document
        .getElementById(
            'maleVotes'
        )
        .textContent =
        data.maleVotes;


    document
        .getElementById(
            'femaleVotes'
        )
        .textContent =
        data.femaleVotes;


    document
        .getElementById(
            'reportUpdated'
        )
        .textContent =
        `อัปเดตล่าสุด ${data.updatedAt}`;


    renderResultList(
        'maleReport',
        data.male
    );


    renderResultList(
        'femaleReport',
        data.female
    );

}


/* =====================================================
   RESULT LIST
===================================================== */

function renderResultList(
    elementId,
    results
) {

    const container =
        document.getElementById(
            elementId
        );


    container.innerHTML =
        '';


    if (
        !results ||
        results.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-report">

                ยังไม่มีข้อมูลผู้เข้าประกวด

            </div>

        `;

        return;

    }


    results.forEach(
        result => {

            const item =
                document.createElement(
                    'div'
                );


            item.className =
                'result-item';


            const medal =
                result.rank === 1
                    ? '🥇'
                    : result.rank === 2
                        ? '🥈'
                        : result.rank === 3
                            ? '🥉'
                            : `#${result.rank}`;


            item.innerHTML = `

                <div
                    class="result-rank"
                >

                    ${medal}

                </div>


                <div
                    class="result-info"
                >

                    <strong>

                        ${escapeHtml(
                            result.id
                        )}

                        |

                        ${escapeHtml(
                            result.nickname
                        )}

                    </strong>


                    <div
                        class="result-bar"
                    >

                        <div
                            class="result-bar-fill"
                            style="
                                width:
                                ${result.percentage}%;
                            "
                        ></div>

                    </div>


                    <small>

                        ${result.percentage}%

                    </small>

                </div>


                <div
                    class="result-score"
                >

                    <strong>
                        ${result.score}
                    </strong>

                    <small>
                        คะแนน
                    </small>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =====================================================
   REFRESH REPORT
===================================================== */

async function refreshReport() {

    if (!reportAuthenticated) {

        return;

    }


    const password =
        prompt(
            'กรุณากรอกรหัสผ่านผู้ดูแลระบบ'
        );


    if (!password) {

        return;

    }


    try {

        showLoading();


        const result =
            await api({

                action:
                    'getReport',

                password:
                    password

            });


        if (!result.success) {

            throw new Error(
                result.message
            );

        }


        renderReport(
            result
        );


    } catch (error) {

        showModal(

            'ไม่สามารถอัปเดตได้',

            error.message,

            '⚠️'

        );

    } finally {

        hideLoading();

    }

}


/* =====================================================
   LOGOUT REPORT
===================================================== */

function logoutReport() {

    reportAuthenticated =
        false;


    document
        .getElementById(
            'reportArea'
        )
        .classList.add(
            'hidden'
        );


    document
        .getElementById(
            'reportLogin'
        )
        .classList.remove(
            'hidden'
        );


    document
        .getElementById(
            'adminPassword'
        )
        .value =
        '';


    showModal(

        'ออกจากรายงานแล้ว',

        'ระบบได้ซ่อนข้อมูลผลโหวตแล้ว',

        '🔒'

    );

}


/* =====================================================
   RESET VOTE
===================================================== */

function resetVotePage() {

    currentVoter =
        null;


    currentType =
        null;


    voteStatus = {

        male:
            false,

        female:
            false

    };


    document
        .getElementById(
            'voteGroupStep'
        )
        .classList.remove(
            'hidden'
        );


    document
        .getElementById(
            'voterStep'
        )
        .classList.add(
            'hidden'
        );


    document
        .getElementById(
            'votingArea'
        )
        .classList.add(
            'hidden'
        );


    document
        .getElementById(
            'voterSelect'
        )
        .innerHTML = `

            <option value="">

                -- เลือกผู้มีสิทธิ์ --

            </option>

        `;


    document
        .getElementById(
            'groupSelect'
        )
        .value =
        '';

}


/* =====================================================
   API
===================================================== */

async function api(
    payload
) {

    const response =
        await fetch(

            CONFIG.API_URL,

            {

                method:
                    'POST',

                headers: {

                    'Content-Type':
                        'text/plain;charset=utf-8'

                },

                body:
                    JSON.stringify(
                        payload
                    )

            }

        );


    if (!response.ok) {

        throw new Error(
            `HTTP ${response.status}`
        );

    }


    return await response.json();

}


/* =====================================================
   MODAL
===================================================== */

function showModal(

    title,

    message,

    icon = '✓',

    confirm = false,

    callback = null

) {

    document
        .getElementById(
            'modalTitle'
        )
        .textContent =
        title;


    document
        .getElementById(
            'modalMessage'
        )
        .innerHTML =
        message;


    document
        .getElementById(
            'modalIcon'
        )
        .textContent =
        icon;


    const actions =
        document
            .getElementById(
                'modalActions'
            );


    if (confirm) {

        actions.innerHTML = `

            <button
                class="btn"
                style="
                    background:#e9f0f1;
                    color:#31545a;
                    margin-top:0;
                "
                onclick="closeModal()"
            >

                ยกเลิก

            </button>


            <button
                class="btn"
                id="modalConfirm"
                style="
                    margin-top:0;
                "
            >

                ยืนยัน

            </button>

        `;


        document
            .getElementById(
                'modalConfirm'
            )
            .onclick =
            callback;


    } else {

        actions.innerHTML = `

            <button
                class="btn"
                style="
                    margin-top:0;
                "
                onclick="closeModal()"
            >

                ตกลง

            </button>

        `;

    }


    document
        .getElementById(
            'modal'
        )
        .classList.remove(
            'hidden'
        );

}


function closeModal() {

    document
        .getElementById(
            'modal'
        )
        .classList.add(
            'hidden'
        );

}


/* =====================================================
   LOADING
===================================================== */

function showLoading() {

    document
        .getElementById(
            'loading'
        )
        .classList.remove(
            'hidden'
        );

}


function hideLoading() {

    document
        .getElementById(
            'loading'
        )
        .classList.add(
            'hidden'
        );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(
    value
) {

    return String(
        value || ''
    )

        .replace(
            /&/g,
            '&amp;'
        )

        .replace(
            /</g,
            '&lt;'
        )

        .replace(
            />/g,
            '&gt;'
        )

        .replace(
            /"/g,
            '&quot;'
        )

        .replace(
            /'/g,
            '&#039;'
        );

}