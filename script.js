// ========== SUPABASE ==========
const SUPABASE_URL = 'https://tufzwbvrxfrvythibsma.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ipw4c_9SdJBwxZCMaz7OtQ_KiG7AIuS';
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== СОСТОЯНИЕ ==========
let currentUser = null;
let currentTopic = '';
let timerInterval = null;
let timerSeconds = 0;
let userEssays = []; // Кэш текстов для анализа

// ========== НАВИГАЦИЯ ==========
function navigateTo(page) {
    document.querySelectorAll('[id^="page-"]').forEach(p => p.style.display = 'none');
    const target = document.getElementById('page-' + page);
    if (target) target.style.display = (page === 'dashboard') ? 'block' : 'flex';
    if (page === 'dashboard') initDashboard();
    if (page === 'index' || page === 'login' || page === 'register') {
        document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active-section'));
    }
}

// ========== ТЕМА ОФОРМЛЕНИЯ ==========
function toggleTheme() {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
}
(function() {
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

// ========== МОДАЛКА СОГЛАШЕНИЯ ==========
document.addEventListener('click', function(e) {
    if (e.target.id === 'show-agreement-btn') {
        e.preventDefault();
        document.getElementById('agreement-modal').classList.add('active');
    }
    if (e.target.id === 'close-agreement-btn' || e.target.id === 'accept-agreement-btn') {
        document.getElementById('agreement-modal').classList.remove('active');
        if (e.target.id === 'accept-agreement-btn') {
            document.getElementById('reg-agreement').checked = true;
        }
    }
});

// ========== РЕГИСТРАЦИЯ ==========
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Регистрация...'; btn.disabled = true;
    const { error } = await window.supabaseClient.auth.signUp({
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        options: {
            data: {
                first_name: document.getElementById('reg-first-name').value,
                last_name: document.getElementById('reg-last-name').value,
                gender: document.getElementById('reg-gender').value,
                birth_year: document.getElementById('reg-birth-year').value,
                english_level: document.getElementById('reg-english-level').value,
                goal: document.getElementById('reg-goal').value
            }
        }
    });
    if (error) {
        document.getElementById('reg-error').textContent = error.message;
        btn.textContent = 'Зарегистрироваться';
        btn.disabled = false;
    } else {
        alert('Регистрация успешна! Теперь войдите.');
        navigateTo('login');
    }
});

// ========== ВХОД ==========
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Вход...'; btn.disabled = true;
    const { error } = await window.supabaseClient.auth.signInWithPassword({
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
    });
    if (error) {
        document.getElementById('login-error').textContent = 'Неверный email или пароль.';
        btn.textContent = 'Войти'; btn.disabled = false;
    } else {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        currentUser = user;
        navigateTo('dashboard');
    }
});

// ========== ВЫХОД ==========
document.getElementById('logout-btn').addEventListener('click', async () => {
    await window.supabaseClient.auth.signOut();
    currentUser = null;
    userEssays = [];
    navigateTo('index');
});

// ========== ДАШБОРД: НАВИГАЦИЯ ПО СЕКЦИЯМ ==========
function showSection(name) {
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active-section'));
    document.querySelectorAll('.dashboard-nav a').forEach(a => a.classList.remove('active-nav'));
    
    const section = document.getElementById('section-' + name);
    const navBtn = document.querySelector(`.dashboard-nav [data-section="${name}"]`);
    
    if (section) section.classList.add('active-section');
    if (navBtn) navBtn.classList.add('active-nav');
    
    if (name === 'checklist') renderDetailedChecklist();
    if (name === 'dictionary') renderPersonalDictionary();
    if (name === 'levels') renderLevelTest();
    if (name === 'profile') renderProfile();
}

// ========== ИНИЦИАЛИЗАЦИЯ ДАШБОРДА ==========
async function initDashboard() {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) { navigateTo('login'); return; }
    currentUser = user;
    showSection('trainer');
    await loadHistory();
    await loadStats();
    renderProfile();
    // Подсветка активной кнопки
    document.querySelector('.dashboard-nav [data-section="trainer"]').classList.add('active-nav');
}

// ========== ТРЕНАЖЁР ==========
document.getElementById('generate-topic-btn').addEventListener('click', () => {
    // Библиотека тем. ВАЖНО: Здесь нужно будет расширить до 300 тем на каждую цель.
    const topics = {
        business: [
    'Write an email to a client explaining a 2-week delay in the project timeline.',
    'Draft a complaint letter to a supplier about a faulty batch of products.',
    'Compose a follow-up email after a networking conference.',
    'Write a memo announcing a new remote work policy.',
    'Request a letter of recommendation from a former manager.',
    'Write a proposal for a budget increase for your marketing department.',
    'Draft a meeting agenda for a quarterly review with stakeholders.',
    'Compose a rejection letter to a job applicant politely.',
    'Write a LinkedIn message asking for an informational interview.',
    'Create a project handover document for a colleague going on leave.',
    'Write a formal apology to a customer for a billing error.',
    'Draft a contract termination notice to a vendor.',
    'Write a cover letter for an internal promotion you are seeking.',
    'Compose an out-of-office auto-reply for a business trip.',
    'Write a memo announcing a merger with another company.',
    'Draft a performance improvement plan for an underperforming employee.',
    'Write a negotiation email to a freelancer regarding their rates.',
    'Compose a thank you note to a client after closing a big deal.',
    'Write a SWOT analysis report for a new product launch.',
    'Draft a press release announcing a new CEO.',
    'Write a summary of key takeaways from an hour-long sales call.',
    'Compose a request for proposal (RFP) for IT services.',
    'Write an internal announcement for a team member’s promotion.',
    'Draft a crisis communication plan for a data breach.',
    'Write a LinkedIn post celebrating your company’s 5-year anniversary.',
    'Compose a reminder email about an unpaid invoice (30 days overdue).',
    'Write a short business case for adopting a 4-day work week.',
    'Draft a script for a cold call to a potential lead.',
    'Write a memo reminding staff about cybersecurity best practices.',
    'Compose a letter of intent to purchase a smaller competitor.',
    'Write an evaluation of a new CRM software your team tried.',
    'Draft a termination letter for a probationary employee.',
    'Write a customer satisfaction survey email after a support ticket.',
    'Compose a pitch deck slide description for "Market Opportunity".',
    'Write a job description for a remote customer success manager.',
    'Draft a reply to a negative Google review about your business.',
    'Write a congratulatory message to a supplier on their industry award.',
    'Compose an agenda for a weekly sprint planning meeting.',
    'Write a policy for reimbursing employee work-from-home expenses.',
    'Draft a memo about new safety protocols in a warehouse.',
    'Write a proposal to sponsor a local charity event.',
    'Compose a follow-up sequence (3 emails) for a non-responder lead.',
    'Write a summary of a competitor’s new pricing strategy.',
    'Draft a resignation letter for a senior executive role.',
    'Write a request for a reference check on a potential hire.',
    'Compose a welcome email to a new board member.',
    'Write a report on the ROI of the last Google Ads campaign.',
    'Draft a non-disclosure agreement (NDA) in plain English.',
    'Write a response to a journalist’s request for a comment.',
    'Compose an email announcing a price increase starting next quarter.',
    'Write a checklist for onboarding a new remote employee.',
    'Draft a speech for a manager to give at a team meeting.',
    'Write a memo instructing staff to clear their desks for fire safety.',
    'Compose a reminder about an upcoming tax deadline for contractors.',
    'Write a formal thank you to an event speaker.',
    'Draft a strategy for reducing customer churn by 10%.',
    'Write an email to HR requesting parental leave.',
    'Compose a message to a client apologizing for a missed deadline.',
    'Write a one-page executive summary of a 50-page annual report.',
    'Draft a letter of recommendation for a junior employee you are losing.',
    'Write a proposal to outsource the cleaning staff.',
    'Compose a social media policy for employees to follow.',
    'Write an incident report about a minor workplace accident.',
    'Draft an email to a vendor renegotiating payment terms (net-30 to net-60).',
    'Write a product launch announcement for internal staff.',
    'Compose a note to IT requesting new laptops for the sales team.',
    'Write a critique of the last all-hands meeting.',
    'Draft a memo about a temporary office closure due to weather.',
    'Write a business thank you card for a referral partner.',
    'Compose a script for a voicemail greeting for a small business.',
    'Write an analysis of why a marketing campaign failed.',
    'Draft a letter to a landlord about unsafe parking conditions.',
    'Write an email canceling a subscription to expensive software.',
    'Compose a note encouraging a burnt-out employee to take time off.',
    'Write a summary of a webinar about new tax laws.',
    'Draft a proposal for a mentorship program inside the company.',
    'Write a response to a lowball offer from a customer.',
    'Compose a memo about the correct procedure for expense reports.',
    'Write a job offer letter to a candidate they are excited about.',
    'Draft a project post-mortem (lessons learned) document.',
    'Write an email requesting a specific day off for a family event.',
    'Compose a message to a courier service about a lost package.',
    'Write a pitch for a "lunch and learn" session on AI tools.',
    'Draft a privacy policy update notification for users.',
    'Write an apology to the whole team for a leadership mistake.',
    'Compose a notification that the office coffee machine is broken.',
    'Write a short business plan for a pop-up shop.',
    'Draft an email asking a former employee to return as a contractor.',
    'Write a memo about new branding guidelines (logo usage).',
    'Compose a complaint to an ad platform about a banned creative.',
    'Write a strategy for handling a viral PR disaster.',
    'Draft a certificate of appreciation for a volunteer.',
    'Write an email introducing a new AI assistant to the team.',
    'Compose a reminder about the end-of-quarter reporting deadline.',
    'Write a proposal to install electric vehicle chargers at the office.',
    'Draft a letter terminating a contract with a bad client.',
    'Write a summary of feedback from a focus group.',
    'Compose an internal job posting for a team lead role.',
    'Write a note to accounting to correct your salary deposit.',
    'Draft a memo about cell phone usage during meetings.',
    'Write an email to a client upselling a premium support package.',
    'Compose a response to a subpoena for business records (general).',
    'Write a checklist for closing down the office before a holiday.',
    'Draft a request to a university for a career fair booth.',
    'Write a message to a partner about a joint venture idea.',
    'Compose a memo about the importance of data hygiene in the CRM.',
    'Write an agenda for a conflict resolution meeting between two staff.',
    'Draft a press statement denying a false rumor about the company.',
    'Write an email offering a discount to a customer who had a bad experience.',
    'Compose a note to the janitorial staff about a specific mess.',
    'Write a business case for switching to renewable energy.',
    'Draft a letter demanding payment from a severely overdue account.',
    'Write a profile of your ideal customer (one paragraph).',
    'Compose an announcement for a new company charity partnership.',
    'Write a memo about the dress code changing to casual Friday every day.',
    'Draft an email to a bank manager requesting a loan extension.',
    'Write a summary of the key points from a bankruptcy filing of a rival.',
    'Compose a "get well soon" message to a client who is ill.',
    'Write a proposal for a weekly team-building game (15 mins).',
    'Draft an incident report about a verbal altercation between coworkers.',
    'Write an email to a web developer listing bugs on your site.',
    'Compose a thank you to the IT team after a system restore.',
    'Write a memo announcing a "no meeting Wednesday" policy.',
    'Draft a response to a Better Business Bureau complaint.',
    'Write a one-paragraph success story about a rescued account.',
    'Compose an email inviting alumni to a company reunion.',
    'Write a note asking a colleague to stop interrupting you.',
    'Draft a plan for liquidating obsolete inventory.',
    'Write a proposal for a paid family leave policy.',
    'Compose a memo about the correct use of the company credit card.',
    'Write an email to a hotel confirming a group booking for a retreat.',
    'Draft a speech for a retirement party of a long-time employee.',
    'Write a summary of a patent application your company is filing.',
    'Compose a reminder to update your emergency contact info.',
    'Write a letter asking a celebrity to endorse your product.',
    'Draft a memo about the dangers of using public WiFi without a VPN.',
    'Write a job rejection letter that actually offers constructive feedback.',
    'Compose an email to a supplier asking for a sample of a new material.',
    'Write a business haiku about quarterly profits (fun).',
    'Draft a sustainability report (one page) for stakeholders.',
    'Write a message to a coworker who forgot to mute themselves on a call.',
    'Compose an apology for "reply all" storm that crashed the server.',
    'Write a proposal to remove the popcorn machine because it smells.',
    'Draft an email to a client that their check bounced.',
    'Write a memo announcing a new bereavement leave policy.',
    'Compose a note to security about granting access to a new hire.',
    'Write a summary of a panel discussion you attended.',
    'Draft a letter of consent to use an employee’s photo in marketing.',
    'Write an email to a landlord exercising a renewal option on a lease.',
    'Compose a message to a slow-paying client offering a payment plan.',
    'Write a short guide on how to write a professional email.',
    'Draft a memo about removing plastic cups from the kitchen.',
    'Write an email to FedEx disputing a delivery charge.',
    'Compose a request to a graphic designer for a logo revision.',
    'Write a proposal for an Employee of the Month program.',
    'Draft an apology to a speaker for the bad AV equipment.',
    'Write a note to accounting to reimburse a business lunch.',
    'Compose an email to a client thanking them for a gift basket.',
    'Write a summary of a legal liability clause in simple terms.',
    'Draft a memo about the schedule for the fire drill.',
    'Write an email to a recruiter pausing your job search.',
    'Compose a message to a team about a sudden budget freeze.',
    'Write a proposal for a bring-your-dog-to-work day.',
    'Draft a letter to a collections agency verifying a debt.',
    'Write an email to a utility company setting up service for a new office.',
    'Compose a warning memo about phishing emails circulating.',
    'Write a short script for a voicemail asking for a callback.',
    'Draft a memo about cleaning up shared Google Drive folders.',
    'Write an email to a client declining a meeting request (too busy).',
    'Compose a weekly status report (template text).',
    'Write a note to a supplier complimenting their delivery speed.',
    'Draft a proposal to buy donuts for the team every Friday.',
    'Write a message to a coworker about a typo in a shared document.',
    'Compose an email to IT requesting a software license transfer.',
    'Write a one-page analysis of shipping cost increases.',
    'Draft a memo about the new overtime approval process.',
    'Write an apology for accidentally leaking a discount code.',
    'Compose a letter to a former client trying to win them back.',
    'Write a summary of a sales team’s quarterly targets.',
    'Draft a non-compete clause explanation for a freelancer.',
    'Write an email about the correct way to label meeting invites.',
    'Compose a message to a venue canceling a holiday party booking.',
    'Write a proposal for a silent reading room in the office.',
    'Draft a memo about the dangers of gossip in the workplace.',
    'Write an email requesting a stakeholder’s signature on a document.',
    'Compose a note to a customer confirming their order is shipped.',
    'Write a strategy for dealing with a social media troll.',
    'Draft an email to a landlord reporting a broken elevator.',
    'Write a memo asking staff to unplug appliances before leaving.',
    'Compose a message to a colleague asking for help with Excel.',
    'Write a proposal for a subscription to a business magazine.',
    'Draft a letter to a bank disputing a fraudulent transaction.',
    'Write an email to a client setting boundaries on response times.',
    'Compose a thank you to a vendor for a holiday ham.',
    'Write a summary of a competitor’s job postings to see their strategy.',
    'Draft a memo about the location of the first aid kit.',
    'Write an email endorsing a colleague for a promotion.',
    'Compose a reminder that the parking lot is for customers only.',
    'Write a proposal for a wellness stipend (gym membership).',
    'Draft a note to a coworker who microwaves fish every day.',
    'Write an email to a client introducing a new account manager.',
    'Compose a message about a server maintenance outage tonight.',
    'Write a one-paragraph case study of your best client.',
    'Draft a memo about the procedure for office key handover.',
    'Write an email to a printer company complaining about toner quality.',
    'Compose a request to legal to review a standard contract.',
    'Write a proposal to sponsor a little league team.',
    'Draft a message to a team about the "quiet period" before earnings.',
    'Write an email to a candidate asking for their start date.',
    'Compose a note to the cleaning staff about recycling bins.',
    'Write a summary of a podcast episode about negotiation.',
    'Draft a memo announcing the winner of a sales contest.',
    'Write an apology for a double booking in your calendar.',
    'Compose a message to a client about a change in your phone number.',
    'Write a proposal for a new filing system for invoices.',
    'Draft an email to a website host reporting downtime.',
    'Write a note to HR about a dietary restriction for a team lunch.',
    'Compose a request to a data analyst for a specific report.',
    'Write a memo about the correct way to answer the office phone.',
    'Draft a letter of expectation for a remote worker not logging hours.',
    'Write an email to a client celebrating their 10th year with you.',
    'Compose a reminder about the password policy (no post-it notes).',
    'Write a proposal for a "no internal emails on Friday" trial.',
    'Draft a memo about the new coffee pod recycling program.',
    'Write an email to a coworker who took credit for your idea.',
    'Compose a notification about a delayed quarterly bonus.',
    'Write a summary of the main points of a new SEC regulation.',
    'Draft a memo about the dangers of leaving laptops in cars.',
    'Write a proposal to hire an intern for the summer.',
    'Compose an email to a venue confirming the catering menu.',
    'Write a note to a client apologizing for aggressive sales tactics.',
    'Draft a job description for a "Director of First Impressions" (receptionist).',
    'Write an email to a bank setting up a wire transfer.',
    'Compose a memo about the correct disposal of confidential documents.',
    'Write a strategy for retaining employees during a merger.',
    'Draft a message to a team member about their body odor (professionally).',
    'Write a proposal for a standing desk stipend.',
    'Compose an email to a shipping company to redirect a package.',
    'Write a summary of a customer support chat log for training.',
    'Draft a memo about the new "be kind" policy.',
    'Write an apology to a supplier for a late payment.',
    'Compose a request to a former employer for a tax document (W2/1099).',
    'Write a proposal to install a vending machine in the break room.',
    'Draft a memo about the schedule for the pest control visit.',
    'Write an email to a client asking for a testimonial.',
    'Compose a message to a coworker about a broken office chair.',
    'Write a one-page disaster recovery plan for the IT system.',
    'Draft a letter to a vendor terminating a trial agreement.',
    'Write an email to a partner about a delayed press release.',
    'Compose a note to a freelancer asking for an invoice revision.',
    'Write a proposal for a free snack bar to boost morale.',
    'Draft a memo about the etiquette for using the conference room.',
    'Write an email to a client refusing an unreasonable request.',
    'Compose a thank you to a team for working over the weekend.',
    'Write a summary of a town hall meeting Q&A.',
    'Draft a memo about the new travel booking portal.',
    'Write an email to a client congratulating them on their promotion.',
    'Compose a message to a coworker who keeps leaving the fridge open.',
    'Write a proposal to change the company holiday schedule.',
    'Draft an email to a landlord about a noisy neighbor business.',
    'Write a memo about the procedure for requesting PTO.',
    'Compose a note to a supplier asking for a certificate of insurance.',
    'Write a one-paragraph explanation of "opportunity cost" for interns.',
    'Draft a memo about the new signature block format for emails.',
    'Write an email to a client about a scope creep warning.',
    'Compose a message to a team about the "clean desk" policy.',
    'Write a proposal for a monthly pizza party on a budget.',
    'Draft a letter of thanks to a firefighter who visited the office.',
    'Write an email to a bank confirming a signature card.',
    'Compose a reminder about the phone system voicemail PIN.',
    'Write a summary of a quality assurance report.',
    'Draft a memo about the new bug tracking tool.',
    'Write an email to a customer offering a free warranty extension.',
    'Compose a note to a coworker about a smell in the microwave.',
    'Write a proposal for a diversity and inclusion book club.',
    'Draft a memo about the deadline for self-assessments.',
    'Write an email to a client acknowledging receipt of a payment.',
    'Compose a request to marketing for a one-pager.',
    'Write a strategy for dealing with a union organizing drive.',
    'Draft a memo about the new key card access times.',
    'Write an apology for a lost check in the mail.',
    'Compose a message to a team about the water cooler being moved.',
    'Write a proposal for a "bring your own mug" policy to reduce waste.',
    'Draft an email to a candidate withdrawing a job offer.',
    'Write a memo about the new procedure for international wires.'
],
        ielts_academic: [
    'Some people think that technology makes life too complex. To what extent do you agree?',
    'Discuss the advantages and disadvantages of studying abroad.',
    'The rise of social media has destroyed real-life communication. Discuss.',
    'Governments should invest more in public transport than roads. Do you agree?',
    'Globalization is creating a single world culture. Is this positive or negative?',
    'Many universities require students to take general education courses. Is this necessary?',
    'Climate change is the biggest threat to humanity today. Do you agree?',
    'Some believe that unpaid community service should be compulsory in high school. Discuss.',
    'The gap between rich and poor is widening. What are the causes and solutions?',
    'Advertising often encourages people to buy things they do not need. Do you agree?',
    'Space exploration is a waste of money. To what extent do you agree?',
    'Discuss the pros and cons of a cashless society.',
    'Prison is not an effective punishment for most criminals. Do you agree?',
    'Should parents be held legally responsible for their children’s actions?',
    'The internet gives people access to too much information. Is this a problem?',
    'Some think that art is an essential subject for children. Others say it is a waste of time. Discuss.',
    'Animal testing for cosmetics and medicine should be banned. Do you agree?',
    'The best way to solve traffic congestion is to invest in public transport. Discuss.',
    'Many young people leave rural areas to live in cities. What problems does this cause?',
    'Some believe that homework is unnecessary. Evaluate this view.',
    'Traditional medicine is better than modern medicine. Do you agree or disagree?',
    'The primary purpose of education should be to prepare for work. Discuss.',
    'Should governments tax sugary drinks to fight obesity?',
    'Tourism often destroys the culture it claims to celebrate. Discuss.',
    'Some think that university should be free for everyone. Others say students should pay. Discuss.',
    'Nuclear power is too dangerous to be used as an energy source. Do you agree?',
    'Online learning will completely replace traditional classrooms. To what extent?',
    'The death penalty is a necessary deterrent for serious crimes. Do you agree?',
    'Discuss the causes of increasing stress levels among young professionals.',
    'Some believe that gender quotas in politics are fair. Others say they are discriminatory. Discuss.',
    'Should professional athletes be role models for children?',
    'The rise of automation will create more jobs than it destroys. Do you agree?',
    'Many historical buildings are demolished to make way for modern ones. Is this acceptable?',
    'Some think that immigration enriches a country’s culture. Others see it as a threat. Discuss.',
    'Governments should censor violent content in movies and video games. Do you agree?',
    'Discuss the advantages and disadvantages of genetic engineering in agriculture.',
    'Some say that celebrities have a right to privacy. Others say they give it up. Discuss.',
    'The only purpose of a corporation is to make money for shareholders. Do you agree?',
    'Should schools teach students about budgeting and taxes instead of history?',
    'Many species are going extinct due to human activity. What can be done?',
    'Some believe that luck is more important than hard work for success. Discuss.',
    'Is the concept of a "living wage" economically viable?',
    'Social media has made people more lonely, not less. To what extent?',
    'Universities should prioritize practical skills over theoretical knowledge. Do you agree?',
    'Discuss the effects of long working hours on family relationships.',
    'Some think that international aid does more harm than good. Evaluate this.',
    'Should parents limit screen time for teenagers?',
    'The fashion industry is a major polluter. What should be done?',
    'Some believe that competition is harmful for children. Others say it is essential. Discuss.',
    'Is democracy the best form of government for all countries?',
    'The rise of electric vehicles will solve most environmental problems. Do you agree?',
    'Discuss the psychological effects of job insecurity on employees.',
    'Some think that professionals like doctors and engineers should work in the country where they trained. Do you agree?',
    'Should governments provide free childcare to encourage parents to work?',
    'The media focuses too much on bad news. What are the consequences?',
    'Some believe that happiness comes from within. Others say it depends on external factors. Discuss.',
    'Is it ethical to use artificial intelligence in hiring decisions?',
    'Many old people live in care homes. Is this better or worse than living with family?',
    'Some think that violent video games cause real-world violence. Do you agree?',
    'Discuss the challenges of providing clean drinking water to all people.',
    'Should there be a limit on the number of children a person can have to combat overpopulation?',
    'Some believe that patriotism creates unity. Others say it leads to conflict. Discuss.',
    'The gig economy (Uber, Deliveroo) exploits workers. Do you agree?',
    'Is it better to rent a home or buy one in today’s economy?',
    'Some think that museums and art galleries should be free for citizens. Do you agree?',
    'Discuss the pros and cons of a four-day work week.',
    'Many people are choosing to be self-employed instead of working for a company. Why?',
    'Some believe that zoos are cruel and should be closed. Others say they protect species. Discuss.',
    'Should schools ban junk food completely?',
    'The search for renewable energy is the most important scientific goal today. Do you agree?',
    'Discuss the impact of influencer culture on young people.',
    'Some think that tradition holds society back. Others say it provides stability. Discuss.',
    'Is a universal basic income a good idea for the future?',
    'Many cities are banning cars from the center. What are the advantages and disadvantages?',
    'Some believe that fathers should take the same amount of parental leave as mothers. Do you agree?',
    'Discuss the causes of the global shortage of microchips.',
    'Should voting be compulsory in all democratic elections?',
    'Some think that the arts (music, painting) are a waste of government funding. Discuss.',
    'The rise of remote work is permanently changing office culture. To what extent?',
    'Many people are putting their careers before having children. Is this a problem?',
    'Some believe that we should eat less meat to help the environment. Do you agree?',
    'Discuss the ethical implications of facial recognition technology.',
    'Should schools teach children a second language from kindergarten?',
    'Some think that economic growth always improves quality of life. Do you agree?',
    'The loss of local dialects and languages is inevitable. Is this a bad thing?',
    'Many young people have no interest in politics. Why, and is it a problem?',
    'Some believe that performance-related pay for teachers improves education. Discuss.',
    'Is it ethical to keep animals in captivity for entertainment (SeaWorld, circuses)?',
    'Discuss the effects of the influencer economy on traditional advertising.',
    'Some think that marriage is an outdated institution. Do you agree?',
    'Should governments subsidize electric cars to make them cheaper?',
    'Many people work remotely while traveling. What are the pros and cons of being a "digital nomad"?',
    'Some believe that competition between schools improves education. Discuss.',
    'The primary cause of crime is poverty. Do you agree?',
    'Should there be a legal age limit for buying smartphones?',
    'Discuss the advantages of a society that values punctuality versus one that values flexibility.',
    'Some think that recycling should be mandatory by law. Do you agree?',
    'Is having a university degree still important for success?',
    'Many movies and TV shows depict violence. Does this affect behavior?',
    'Some believe that governments should ban the production of single-use plastics. Discuss.',
    'The best way to help developing countries is to invest in girls’ education. Do you agree?',
    'Should companies be forced to have women in at least 50% of leadership roles?',
    'Discuss the challenges of urban gardening and vertical farming.',
    'Some think that handwriting is a useless skill in the digital age. Do you agree?',
    'The rise of deepfakes is a major threat to trust in media. What can be done?',
    'Some believe that professional sports are corrupt and overpaid. Discuss.',
    'Should employees be monitored by their computers (keystrokes, mouse movement)?',
    'Many people say that childhood obesity is the fault of parents. Do you agree?',
    'Discuss the pros and cons of using cryptocurrency for daily transactions.',
    'Some think that nationalism is a positive force. Others say it leads to war. Discuss.',
    'Is it better to be a generalist or a specialist in today’s job market?',
    'Some believe that online dating has ruined traditional romance. Do you agree?',
    'Should governments ban the sale of energy drinks to children?',
    'The disappearance of physical bookstores is a cultural loss. To what extent?',
    'Some think that people who earn more should pay a higher tax rate. Do you agree?',
    'Discuss the impact of mental health awareness in the workplace.',
    'Many heritage sites are damaged by tourists. How can this be controlled?',
    'Some believe that smart devices are making people less intelligent. Discuss.',
    'Should there be a global language that everyone learns as a second language?',
    'The gig economy offers freedom but no security. Which matters more?',
    'Some think that taking a gap year before university is a waste of time. Do you agree?',
    'Discuss the causes of the loneliness epidemic in modern cities.',
    'Should schools still teach cursive writing?',
    'Some believe that the government should control the price of housing. Do you agree?',
    'The rise of plant-based meat is a positive trend. Discuss.',
    'Many people save money for retirement. Is this still realistic?',
    'Some think that winning is everything in sports. Others say participation matters more. Discuss.',
    'Is it ethical to use human embryos for medical research?',
    'Some believe that the voting age should be lowered to 16. Do you agree?',
    'Discuss the effects of social media on political polarization.',
    'Should companies have the right to refuse service based on religious beliefs?',
    'The solution to poverty is better education, not more money. Do you agree?',
    'Some think that wilderness areas should be off-limits to tourists. Discuss.',
    'Many people are becoming "influencers". Is this a legitimate career?',
    'Some believe that noise pollution is as harmful as air pollution. Do you agree?',
    'Should parents be fined if their children skip school?',
    'Discuss the advantages and disadvantages of an aging population.',
    'Some think that AI will eventually replace most human jobs. Is this a problem?',
    'The rise of the "side hustle" is exhausting workers. Discuss.',
    'Should plastic surgery be banned for non-medical reasons?',
    'Some believe that celebrities should not be allowed to endorse political candidates. Do you agree?',
    'Discuss the impact of droughts on global food security.',
    'Is it better to live in a multicultural city or a homogeneous one?',
    'Some think that homework causes unnecessary stress for children. Do you agree?',
    'Many people are choosing not to have children. Is this a worrying trend?',
    'Some believe that forgiveness is a sign of weakness. Do you agree?',
    'Should there be a maximum age limit for political leaders?',
    'The rise of subscription services (Netflix, Spotify) is bad for consumers. Discuss.',
    'Some think that discipline is more important than creativity in education. Do you agree?',
    'Discuss the problems caused by light pollution in cities.',
    'Should the sale of junk food be banned near schools?',
    'Some believe that manners and etiquette are no longer important. Do you agree?',
    'The best way to motivate employees is to pay them more. Discuss.',
    'Is it acceptable for companies to collect and sell personal data?',
    'Some think that history is a boring subject. How can it be made more engaging?',
    'Many people feel that they have no control over their lives. What causes this?',
    'Some believe that governments should invest in high-speed rail, not airlines. Do you agree?',
    'Discuss the pros and cons of having children later in life.',
    'Should there be a universal basic internet connection provided by the government?',
    'Some think that fashion is an art form. Others say it is just consumerism. Discuss.',
    'The use of drones for delivery is convenient but intrusive. Discuss.',
    'Some believe that you are either born a leader or you are not. Do you agree?',
    'Should schools teach about religion in an objective way?',
    'Many people are obsessed with self-improvement. Is this healthy?',
    'Some think that keeping a pet is a human right. Others say it is unnecessary. Discuss.',
    'The rise of crowdfunding is changing how we finance projects. Is it reliable?',
    'Some believe that failure is the best teacher. Do you agree?',
    'Discuss the challenges of regulating artificial intelligence.',
    'Should the government provide free internet access to low-income families?',
    'Some think that memorization is an outdated learning technique. Do you agree?',
    'Many people fear speaking in public. How can this be overcome?',
    'Is it better to make a decision quickly or to take a long time to decide?',
    'Some believe that noise-cancelling headphones are making people antisocial. Discuss.',
    'Should there be a "junk food tax" similar to the sugar tax?',
    'The rise of co-working spaces is changing the nature of work. Discuss.',
    'Some think that empathy is more important than intelligence for success. Do you agree?',
    'Should schools be required to teach financial literacy?',
    'Many people do not trust the news media. What are the causes?',
    'Some believe that dreams have meaning. Others say they are random. Discuss.',
    'Is it ethical to test products on human volunteers for high pay?',
    'The best way to reduce pollution is to increase fuel prices. Do you agree?',
    'Some think that volunteering should be required for all teenagers. Discuss.',
    'Should there be a limit on how much a CEO can earn compared to a worker?',
    'Many people are addicted to their phones. Is this the individual’s fault or society’s?',
    'Some believe that classical music is superior to popular music. Do you agree?',
    'Discuss the advantages and disadvantages of living in a "smart city".',
    'Should surveillance cameras be placed in all public areas?',
    'Some think that hard work guarantees success. Is this true?',
    'The rise of meal delivery kits is wasteful but convenient. Discuss.',
    'Is it better to have a job you love with low pay or a job you hate with high pay?',
    'Some believe that graffiti is art. Others say it is vandalism. Discuss.',
    'Should governments invest in nuclear fusion research despite the cost?',
    'Many people struggle to maintain work-life balance. What can employers do?',
    'Some think that reading fiction is a waste of time. Do you agree?',
    'Discuss the impact of uniform pricing in global markets.',
    'Should strong passwords be legally required for all online accounts?',
    'Some believe that the pursuit of happiness is a selfish goal. Do you agree?',
    'The best way to learn a language is to live in the country. Discuss.',
    'Is it ethical to use animals to test medical treatments?',
    'Some think that social status is determined by wealth. Others say it is about character. Discuss.',
    'Many people are turning to alternative medicine. Is this a problem?',
    'Some believe that noise in open-plan offices reduces productivity. Do you agree?',
    'Should there be a global tax on carbon emissions?',
    'The rise of live streaming is creating a new generation of celebrities. Discuss.',
    'Some think that children should be allowed to fail. Do you agree?',
    'Discuss the pros and cons of using biometric data (fingerprints, face ID) for security.',
    'Should influencers be required to label paid promotions more clearly?',
    'Some believe that cultural appropriation is a serious issue. Others say it is harmless. Discuss.',
    'Is it better to save money or to spend money on experiences?',
    'Many people feel that time is moving faster as they age. Why?',
    'Some think that space tourism is an irresponsible waste of resources. Do you agree?',
    'Should companies be required to publish their gender pay gap data?',
    'The rise of remote work is good for the environment. Discuss.',
    'Some believe that competition is more motivating than collaboration. Do you agree?',
    'Should schools eliminate grades and use only written feedback?',
    'Many people are addicted to online shopping. What are the causes?',
    'Some think that modern architecture is ugly compared to old buildings. Do you agree?',
    'Discuss the effects of the "24-hour news cycle" on public anxiety.',
    'Should there be a tax on automation to fund social programs?',
    'Some believe that optimism is more important than realism for success. Do you agree?',
    'The best way to learn history is through movies and TV shows. Discuss.',
    'Is it ethical to use placebo treatments in medicine?',
    'Many people prefer texting over calling. What are the social consequences?',
    'Some think that the traditional family structure is no longer the norm. Discuss.',
    'Should the government fund space exploration or solve problems on Earth first?',
    'The rise of "fake news" is a result of poor education. Do you agree?',
    'Some believe that multitasking is a myth. Do you agree?',
    'Discuss the advantages and disadvantages of open-source software.',
    'Should parents give their children an allowance for doing chores?',
    'Many people are afraid of flying despite statistics showing it is safe. Why?',
    'Some think that retirement age should be raised to 70. Do you agree?',
    'Is it better to live in a small town or a big city?',
    'Some believe that handwriting reveals personality. Is this true?',
    'Should there be a law against using phones while walking?',
    'The rise of the "sharing economy" (Airbnb, Uber) is lowering quality standards. Discuss.',
    'Some think that people should only eat food that is locally grown. Do you agree?',
    'Discuss the psychological effects of long-term unemployment.',
    'Should schools teach students how to spot logical fallacies?',
    'Many people believe in astrology despite a lack of evidence. Why?',
    'Some think that silence is uncomfortable. Others find it peaceful. Discuss.',
    'Is it ethical for companies to use "dark patterns" to trick users?',
    'The best way to reduce crime is to reduce income inequality. Do you agree?',
    'Some believe that art is a universal language. Discuss.',
    'Should governments ban the sale of fireworks to reduce animal stress?',
    'Many people are choosing to be child-free. Is this a problem for society?',
    'Some think that positive thinking can cure physical illness. Do you agree?',
    'Discuss the impact of streaming services on the movie theater industry.',
    'Should there be a legal requirement to vote in local elections?',
    'Some believe that mental health days should be treated like sick days. Do you agree?',
    'The rise of DIY culture is a response to consumerism. Discuss.',
    'Is it better to be disliked for who you are or liked for who you are not?',
    'Some think that zoos are necessary for conservation. Others say they are prisons. Discuss.',
    'Should schools require students to learn a musical instrument?',
    'Many people feel pressure to be productive all the time. What causes this?',
    'Some believe that genetic modification of humans is acceptable to prevent disease. Do you agree?',
    'Discuss the pros and cons of a society with no money (gift economy).',
    'Should influencers be held liable for bad advice they give?',
    'Some think that old age homes are better than living with extended family. Do you agree?',
    'The best way to be happy is to lower your expectations. Discuss.',
    'Many people are uncomfortable with silence in conversations. Why?',
    'Some believe that competition between countries is necessary for progress. Do you agree?',
    'Should there be a limit on the number of ads a person sees per day?',
    'The rise of voice assistants (Alexa, Siri) is a privacy risk. Discuss.',
    'Is it ethical to clone animals?',
    'Some think that giving to charity is a moral obligation. Others say it is optional. Discuss.',
    'Many people lie on their resumes. Is this understandable or unacceptable?',
    'Some believe that patience is a forgotten virtue. Do you agree?',
    'Discuss the challenges of managing a team from different generations (Boomers, Gen X, Millennials, Gen Z).',
    'Should the government provide free sanitary products?',
    'Some think that nostalgia is a waste of time. Others say it is important. Discuss.',
    'The best way to save the environment is to have fewer children. Do you agree?',
    'Many people are choosing to be single. Is this a social shift or a problem?',
    'Some believe that online anonymity should be banned. Do you agree?',
    'Discuss the advantages and disadvantages of living in a tiny house.'
],
        
        ielts_general: [
    'Write a letter to a friend inviting them to a family celebration.',
    'Write a letter of complaint to a store manager about a defective product.',
    'Write a letter to your landlord about a problem in your apartment.',
    'Write a letter to a job agency asking for help finding temporary work.',
    'Write a letter to a hotel manager thanking them for excellent service.',
    'Write a letter to a neighbour complaining about loud music at night.',
    'Write a letter to a colleague apologizing for a mistake you made.',
    'Write a letter to a local newspaper recommending a restaurant.',
    'Write a letter to your boss requesting a leave of absence for medical reasons.',
    'Write a letter to a friend explaining why you missed their birthday party.',
    'Write a letter to a council about a broken streetlight in your area.',
    'Write a letter to a university admissions office asking for a course brochure.',
    'Write a letter to a friend giving advice about a job interview.',
    'Write a letter to a bus company complaining about a late bus.',
    'Write a letter to your former teacher asking for a reference letter.',
    'Write a letter to a rental agency reporting a leaky faucet.',
    'Write a letter to a friend suggesting a place for a weekend trip.',
    'Write a letter to a company requesting a refund for an online purchase.',
    'Write a letter to your neighbour thanking them for watering your plants.',
    'Write a letter to a sports club asking for membership information.',
    'Write a letter to a friend describing your new job.',
    'Write a letter to a landlord giving notice that you are moving out.',
    'Write a letter to a local library suggesting a book purchase.',
    'Write a letter to a friend apologizing for losing a borrowed item.',
    'Write a letter to a hotel complaining about a dirty room.',
    'Write a letter to your manager proposing a new idea for the office.',
    'Write a letter to a friend congratulating them on their engagement.',
    'Write a letter to a restaurant reserving a table for a large group.',
    'Write a letter to a colleague thanking them for covering your shift.',
    'Write a letter to a gym asking to cancel your membership.',
    'Write a letter to a friend asking to borrow a tool or equipment.',
    'Write a letter to a city official about a dangerous intersection.',
    'Write a letter to a moving company complaining about damaged furniture.',
    'Write a letter to your professor asking for an extension on an assignment.',
    'Write a letter to a friend describing a recent vacation.',
    'Write a letter to a bank manager disputing a fee on your account.',
    'Write a letter to an airline praising a flight attendant.',
    'Write a letter to a neighbour about a lost package delivered to them by mistake.',
    'Write a letter to a friend giving condolences for a loss.',
    'Write a letter to a school principal about a bullying incident.',
    'Write a letter to a car rental company about a scratch on the car.',
    'Write a letter to a friend asking for help moving to a new house.',
    'Write a letter to a doctor’s office requesting your medical records.',
    'Write a letter to a restaurant manager complimenting the chef.',
    'Write a letter to a friend explaining why you cannot lend them money.',
    'Write a letter to a daycare center enquiring about availability.',
    'Write a letter to a landlord requesting permission to paint a wall.',
    'Write a letter to a friend recommending a movie or TV series.',
    'Write a letter to a delivery company about a missed delivery.',
    'Write a letter to a local council requesting a recycling bin.',
    'Write a letter to a friend inviting them to a concert.',
    'Write a letter to a hotel asking for an early check-in.',
    'Write a letter to an insurance company filing a claim for lost luggage.',
    'Write a letter to a teammate apologizing for missing practice.',
    'Write a letter to a store asking to exchange a gift for a different size.',
    'Write a letter to a friend describing a difficult decision you made.',
    'Write a letter to a training provider complaining about a poor course.',
    'Write a letter to a landlord about a noisy neighbour in the building.',
    'Write a letter to a friend asking for advice about a relationship problem.',
    'Write a letter to a supermarket suggesting they add a new product.',
    'Write a letter to an employer thanking them for the job interview.',
    'Write a letter to a neighbour inviting them to a barbecue.',
    'Write a letter to a phone company complaining about bad reception.',
    'Write a letter to a friend telling them about a funny accident.',
    'Write a letter to a volunteer organization offering your help.',
    'Write a letter to a restaurant about finding a hair in your food.',
    'Write a letter to a friend agreeing to house-sit while they are away.',
    'Write a letter to a school requesting a tour of the facilities.',
    'Write a letter to a courier service complaining about rude delivery driver.',
    'Write a letter to a friend asking to stay at their place for a night.',
    'Write a letter to a bank reporting a lost credit card.',
    'Write a letter to a local politician supporting a new community center.',
    'Write a letter to a colleague asking to swap shifts for next week.',
    'Write a letter to a friend describing how you spent a holiday.',
    'Write a letter to a dentist reminding them of an upcoming appointment (reschedule).',
    'Write a letter to a landlord complaining about insufficient heating.',
    'Write a letter to a friend asking for a recipe you liked.',
    'Write a letter to a job applicant rejecting them politely (as a hiring manager).',
    'Write a letter to a webmaster reporting a broken link on a website.',
    'Write a letter to a friend encouraging them to start a hobby.',
    'Write a letter to a taxi company about a lost phone in a cab.',
    'Write a letter to a daycare thanking the staff for their care.',
    'Write a letter to a neighbour apologizing for damage to their fence.',
    'Write a letter to a friend explaining a change in your life plans.',
    'Write a letter to a store asking to price match a competitor.',
    'Write a letter to a hair salon complaining about a bad haircut.',
    'Write a letter to a friend asking for a loan (petty cash).',
    'Write a letter to a city council requesting a sidewalk repair.',
    'Write a letter to a former colleague asking for job tips.',
    'Write a letter to a landlord requesting a new refrigerator.',
    'Write a letter to a friend describing a stressful situation at work.',
    'Write a letter to a vet asking about post-operative care for a pet.',
    'Write a letter to a courier authorizing them to leave a package.',
    'Write a letter to a friend suggesting a book club.',
    'Write a letter to a hotel complaining that the pool was closed.',
    'Write a letter to a company requesting a catalog of products.',
    'Write a letter to a neighbour complimenting their garden.',
    'Write a letter to a friend warning them about a scam.',
    'Write a letter to a landlord reporting a broken garage door.',
    'Write a letter to a tutoring center asking for rates and schedules.',
    'Write a letter to a friend describing your new year resolutions.',
    'Write a letter to a restaurant about overcharging on a bill.',
    'Write a letter to a charity confirming your donation.',
    'Write a letter to a friend explaining why you are off social media.',
    'Write a letter to a company asking for sponsorship for a sports team.',
    'Write a letter to a landlord asking to adopt a pet.',
    'Write a letter to a friend inviting them to a gym class with you.',
    'Write a letter to a hotel asking about wheelchair accessibility.',
    'Write a letter to a manufacturer asking where to buy spare parts.',
    'Write a letter to a friend thanking them for a thoughtful gift.',
    'Write a letter to a local museum suggesting a new exhibit.',
    'Write a letter to a parking company disputing a ticket.',
    'Write a letter to a friend apologizing for being a bad listener.',
    'Write a letter to a nursery ordering plants for your garden.',
    'Write a letter to a landlord requesting new smoke detectors.',
    'Write a letter to a friend describing your daily commute.',
    'Write a letter to a doctor complaining about long wait times.',
    'Write a letter to a friend asking for feedback on a project.',
    'Write a letter to a bank closing an old account.',
    'Write a letter to a neighbour asking to keep their dog quiet.',
    'Write a letter to a friend proposing a road trip.',
    'Write a letter to a school requesting a transfer for your child.',
    'Write a letter to a cleaning service complaining about a missed spot.',
    'Write a letter to a friend sharing good news about a promotion.',
    'Write a letter to an airline requesting a wheelchair at the gate.',
    'Write a letter to a landlord asking to install a ceiling fan.',
    'Write a letter to a friend describing a cultural event you attended.',
    'Write a letter to a takeaway restaurant complimenting the food.',
    'Write a letter to a friend asking for help with a DIY project.',
    'Write a letter to a city official about the need for a dog park.',
    'Write a letter to a colleague apologizing for a harsh email.',
    'Write a letter to a friend describing your favorite childhood memory.',
    'Write a letter to a repair shop about a device that is still broken.',
    'Write a letter to a landlord requesting a parking space.',
    'Write a letter to a friend telling them you are moving away.',
    'Write a letter to a hotel requesting a late checkout.',
    'Write a letter to a store asking if they can order an item for you.',
    'Write a letter to a friend asking for advice on buying a car.',
    'Write a letter to a rubbish collection service complaining about a missed pickup.',
    'Write a letter to a neighbor thanking them for helping in an emergency.',
    'Write a letter to a friend declining a party invitation politely.',
    'Write a letter to a power company reporting an outage.',
    'Write a letter to a landlord requesting new carpet.',
    'Write a letter to a friend describing a weird dream you had.',
    'Write a letter to a cinema complaining about the screen brightness.',
    'Write a letter to a friend asking them to be a reference for a job.',
    'Write a letter to a community center asking to rent a room.',
    'Write a letter to a friend saying sorry for breaking a promise.',
    'Write a letter to a water company about a high bill (possible leak).',
    'Write a letter to a landlord requesting a new mailbox key.',
    'Write a letter to a friend asking to carpool to work.',
    'Write a letter to a food delivery driver thanking them for great service.',
    'Write a letter to a friend explaining a complicated family situation.',
    'Write a letter to a church asking about volunteer opportunities.',
    'Write a letter to a landlord reporting a pest problem (ants, mice).',
    'Write a letter to a friend suggesting a new hobby for them.',
    'Write a letter to a concert venue asking about disabled access.',
    'Write a letter to a friend asking for help studying for an exam.',
    'Write a letter to a supermarket complaining about expired food on shelf.',
    'Write a letter to a landlord asking to add a roommate to the lease.',
    'Write a letter to a friend telling them about a great sale.',
    'Write a letter to a gas company requesting a safety inspection.',
    'Write a letter to a friend asking them to pick up mail from your house.',
    'Write a letter to a train company about a lost bag on the train.',
    'Write a letter to a landlord thanking them for quick repairs.',
    'Write a letter to a friend asking for a favor without explaining why (mysterious).',
    'Write a letter to a pharmacy about a prescription error.',
    'Write a letter to a friend describing a bad restaurant experience.',
    'Write a letter to a hair salon confirming an appointment.',
    'Write a letter to a landlord requesting permission to have a guest for a month.',
    'Write a letter to a friend congratulating them on quitting a bad habit.',
    'Write a letter to a daycare complaining about a lack of communication.',
    'Write a letter to a friend asking for a recommendation for a doctor.',
    'Write a letter to a bus company suggesting a new route.',
    'Write a letter to a landlord about a broken air conditioner.',
    'Write a letter to a friend asking to borrow their car for a day.',
    'Write a letter to a zoo asking about membership benefits.',
    'Write a letter to a friend inviting them to a religious ceremony.',
    'Write a letter to a tax accountant asking for help (general).',
    'Write a letter to a landlord about a stolen package from the lobby.',
    'Write a letter to a friend asking them to teach you a skill.',
    'Write a letter to a pet store asking for advice on a sick fish.',
    'Write a letter to a friend describing a purchase you regret.',
    'Write a letter to a moving company confirming the time.',
    'Write a letter to a landlord requesting a new stove.',
    'Write a letter to a friend apologizing for gossiping.',
    'Write a letter to a swimming pool asking about adult swim times.',
    'Write a letter to a friend suggesting a digital detox together.',
    'Write a letter to a bakery ordering a custom cake.',
    'Write a letter to a landlord about a clogged toilet.',
    'Write a letter to a friend asking to stay longer on a visit.',
    'Write a letter to a post office about redelivery of a package.',
    'Write a letter to a friend explaining why you changed your hairstyle.',
    'Write a letter to a landlord requesting a washer and dryer.',
    'Write a letter to a friend asking for money saving tips.',
    'Write a letter to a theater about a disruptive audience member.',
    'Write a letter to a friend telling them you are proud of them.',
    'Write a letter to a landlord about a broken window.',
    'Write a letter to a friend asking for a ride to the airport.',
    'Write a letter to a camping site making a reservation.',
    'Write a letter to a friend describing a frustrating technology issue.',
    'Write a letter to a landlord requesting to terminate the lease early.',
    'Write a letter to a friend asking them to be your emergency contact.',
    'Write a letter to a ferry company about a canceled crossing.',
    'Write a letter to a friend giving them a recipe recommendation.',
    'Write a letter to a landlord about a noisy HVAC unit.',
    'Write a letter to a friend asking them to speak at an event.',
    'Write a letter to a recycling center asking what they accept.',
    'Write a letter to a friend telling them about a health scare (resolved).',
    'Write a letter to a landlord requesting a new dishwasher.',
    'Write a letter to a friend apologizing for forgetting a plan.',
    'Write a letter to a shoe repair shop asking for a price estimate.',
    'Write a letter to a friend asking them to cover for you (little white lie).',
    'Write a letter to a landlord about a broken intercom system.',
    'Write a letter to a friend asking for their opinion on a big decision.',
    'Write a letter to a food bank offering to donate.',
    'Write a letter to a friend describing a peaceful moment in nature.',
    'Write a letter to a landlord about missing keys.',
    'Write a letter to a friend inviting them to a protest or march.',
    'Write a letter to a locksmith asking for a quote.',
    'Write a letter to a friend telling them you miss them.',
    'Write a letter to a landlord about a leaking roof.',
    'Write a letter to a friend asking them to delete a photo of you.',
    'Write a letter to a furniture store asking about delivery times.',
    'Write a letter to a friend describing a lucky escape.',
    'Write a letter to a landlord about a broken garbage disposal.',
    'Write a letter to a friend asking for a pep talk.',
    'Write a letter to an optometrist asking for a copy of your prescription.',
    'Write a letter to a friend telling them about a charity you support.',
    'Write a letter to a landlord about a smell in the hallway.',
    'Write a letter to a friend asking them to water your plants (detailed instructions).',
    'Write a letter to a driving school complaining about an instructor.',
    'Write a letter to a friend comparing two potential houses you found.',
    'Write a letter to a landlord about a broken security camera.',
    'Write a letter to a friend asking them to remind you of something.',
    'Write a letter to a hardware store asking about a tool rental.',
    'Write a letter to a friend describing a random act of kindness you witnessed.',
    'Write a letter to a landlord about a drafty window.',
    'Write a letter to a friend asking them to lie for you (ethically questionable).'
],
        social: [
    'Write a LinkedIn post about a recent professional achievement.',
    'Create an Instagram caption for a travel photo in Italy.',
    'Write a Twitter thread explaining a complex topic in simple terms.',
    'Draft a Facebook post promoting a local community event.',
    'Write a LinkedIn post celebrating your work anniversary.',
    'Create an Instagram caption for a picture of your morning coffee.',
    'Write a tweet sharing a controversial opinion about remote work.',
    'Draft a Facebook post asking for recommendations for a plumber.',
    'Write a LinkedIn post announcing you are looking for a new job (open to work).',
    'Create an Instagram caption for a gym selfie about progress not perfection.',
    'Write a Twitter thread reviewing a movie you just watched.',
    'Draft a Facebook post announcing your engagement.',
    'Write a LinkedIn post sharing a lesson you learned from a failure.',
    'Create an Instagram caption for a photo of a sunset with a deep quote.',
    'Write a tweet complaining about a flight delay.',
    'Draft a Facebook post asking for donations to a charity run.',
    'Write a LinkedIn post congratulating a former colleague on a promotion.',
    'Create an Instagram caption for a food picture from a fancy restaurant.',
    'Write a Twitter thread sharing tips for coding beginners.',
    'Draft a Facebook post about your pet doing something silly.',
    'Write a LinkedIn post sharing an industry news article with your take.',
    'Create an Instagram caption for a beach photo using a pun.',
    'Write a tweet celebrating a small personal win (e.g., finally cleaning the garage).',
    'Draft a Facebook post about a power outage in your neighborhood.',
    'Write a LinkedIn post about the importance of work-life balance.',
    'Create an Instagram caption for a mirror outfit check photo.',
    'Write a Twitter thread about the best books you read this year.',
    'Draft a Facebook post selling an old piece of furniture.',
    'Write a LinkedIn post thanking a mentor who helped you.',
    'Create an Instagram caption for a behind-the-scenes photo at work.',
    'Write a tweet asking the internet for advice on a tricky situation.',
    'Draft a Facebook post about a delicious meal you cooked at home.',
    'Write a LinkedIn post arguing against the "hustle culture" mentality.',
    'Create an Instagram caption for a photo with a group of friends (besties).',
    'Write a Twitter thread explaining the latest meme to older generations.',
    'Draft a Facebook post announcing a new baby in the family.',
    'Write a LinkedIn post about a certification you just earned.',
    'Create an Instagram caption for a rainy day aesthetic photo.',
    'Write a tweet making a prediction about the future of AI.',
    'Draft a Facebook post complaining about a bad customer service experience.',
    'Write a LinkedIn post about the value of networking (specific story).',
    'Create an Instagram caption for a hiking photo with a motivational quote.',
    'Write a Twitter thread sharing your morning routine for productivity.',
    'Draft a Facebook post asking for help finding a lost dog.',
    'Write a LinkedIn post about a difficult career decision you made.',
    'Create an Instagram caption for a concert video (concert vibes).',
    'Write a tweet sharing a life hack that actually works.',
    'Draft a Facebook post showing off a home renovation project.',
    'Write a LinkedIn post about imposter syndrome in the workplace.',
    'Create an Instagram caption for a bookstore or library photo.',
    'Write a Twitter thread analyzing a football (soccer) match.',
    'Draft a Facebook post remembering a loved one who passed away.',
    'Write a LinkedIn post about the best leadership advice you ever received.',
    'Create an Instagram caption for a throwback Thursday photo (TBT).',
    'Write a tweet about a weird dream you had last night.',
    'Draft a Facebook post promoting your small business.',
    'Write a LinkedIn post about the importance of mental health at work.',
    'Create an Instagram caption for a makeup or skincare flat lay.',
    'Write a Twitter thread sharing free resources for learning a language.',
    'Draft a Facebook post asking for legal advice (general).',
    'Write a LinkedIn post discussing the future of your industry.',
    'Create an Instagram caption for a cozy night in (Netflix and chill).',
    'Write a tweet sharing a funny joke or pun.',
    'Draft a Facebook post warning neighbors about a car break-in.',
    'Write a LinkedIn post about how to ask for a raise.',
    'Create an Instagram caption for a new haircut or style.',
    'Write a Twitter thread recounting a strange encounter on public transport.',
    'Draft a Facebook post asking for book recommendations.',
    'Write a LinkedIn post about the value of internships.',
    'Create an Instagram caption for a museum or art gallery visit.',
    'Write a tweet sharing an unpopular opinion about food (e.g., pineapple on pizza).',
    'Draft a Facebook post about a local politician or election.',
    'Write a LinkedIn post about returning to the office vs. staying remote.',
    'Create an Instagram caption for a car selfie with a song lyric.',
    'Write a Twitter thread giving advice to your younger self.',
    'Draft a Facebook post about finding a great deal at a thrift store.',
    'Write a LinkedIn post about a failed project and what you learned.',
    'Create an Instagram caption for a festive holiday photo (Christmas, Diwali, etc.).',
    'Write a tweet asking for product recommendations (e.g., headphones).',
    'Draft a Facebook post about a frustrating tech issue (printer, Wi-Fi).',
    'Write a LinkedIn post about the soft skills that matter most.',
    'Create an Instagram caption for a photo of your plant collection.',
    'Write a Twitter thread sharing your experiences with impostor syndrome.',
    'Draft a Facebook post asking for moving company recommendations.',
    'Write a LinkedIn post about how to handle toxic coworkers.',
    'Create an Instagram caption for a birthday post to yourself.',
    'Write a tweet reacting to a breaking news story (hypothetical).',
    'Draft a Facebook post about a great doctor or dentist you visited.',
    'Write a LinkedIn post about the power of saying "no".',
    'Create an Instagram caption for a black and white artistic photo.',
    'Write a Twitter thread sharing your favorite budget recipes.',
    'Draft a Facebook post celebrating a child’s accomplishment (sports, grades).',
    'Write a LinkedIn post about a conference you attended recently.',
    'Create an Instagram caption for a photo of a cat or dog.',
    'Write a tweet sharing a screenshot of a funny conversation.',
    'Draft a Facebook post asking for wedding planning advice.',
    'Write a LinkedIn post about the importance of constructive feedback.',
    'Create an Instagram caption for a view from an airplane window.',
    'Write a Twitter thread sharing the worst gifts you have received.',
    'Draft a Facebook post about a loud construction noise complaint.',
    'Write a LinkedIn post about your side hustle or passion project.',
    'Create an Instagram caption for a summer pool party photo.',
    'Write a tweet sharing a simple recipe in one paragraph.',
    'Draft a Facebook post asking for gaming recommendations (PC/console).',
    'Write a LinkedIn post about how to write a good CV.',
    'Create an Instagram caption for a photo of your home office setup.',
    'Write a Twitter thread about a time you were proven wrong.',
    'Draft a Facebook post looking for a roommate or tenant.',
    'Write a LinkedIn post about the benefits of public speaking.',
    'Create an Instagram caption for a fall/autumn leaves photo.',
    'Write a tweet sharing a random fact you just learned.',
    'Draft a Facebook post about a funny thing your kid said.',
    'Write a LinkedIn post about generational differences in the workplace.',
    'Create an Instagram caption for a post-workout exhaustion photo.',
    'Write a Twitter thread reviewing a new restaurant you tried.',
    'Draft a Facebook post asking for gardening tips.',
    'Write a LinkedIn post about the importance of taking breaks.',
    'Create an Instagram caption for a snow day or winter weather photo.',
    'Write a tweet complaining about spoilers for a TV show.',
    'Draft a Facebook post offering free items you are giving away.',
    'Write a LinkedIn post about shadowing a senior leader.',
    'Create an Instagram caption for a photo of your favorite shoes.',
    'Write a Twitter thread sharing productivity apps you love.',
    'Draft a Facebook post about a lost wallet (asking for help).',
    'Write a LinkedIn post about diversity and inclusion initiatives.',
    'Create an Instagram caption for a birthday party celebration.',
    'Write a tweet asking for the best way to get rid of hiccups.',
    'Draft a Facebook post promoting a garage sale.',
    'Write a LinkedIn post about a time you showed initiative at work.',
    'Create an Instagram caption for a photo of a river or lake.',
    'Write a Twitter thread sharing your workout split (gym routine).',
    'Draft a Facebook post asking for anxiety coping mechanisms.',
    'Write a LinkedIn post about the ethics of AI in hiring.',
    'Create an Instagram caption for a selfie with a new piercing or tattoo.',
    'Write a tweet sharing a fun fact about your hometown.',
    'Draft a Facebook post asking for camping site recommendations.',
    'Write a LinkedIn post about how to survive a toxic workplace.',
    'Create an Instagram caption for a photo of your grandparents.',
    'Write a Twitter thread explaining the plot of a confusing movie.',
    'Draft a Facebook post about a squirrel stealing bird food.',
    'Write a LinkedIn post about the value of a liberal arts education.',
    'Create an Instagram caption for a late-night study session.',
    'Write a tweet sharing your go-to karaoke song.',
    'Draft a Facebook post asking for help identifying a bug or plant.',
    'Write a LinkedIn post about the best way to onboard new employees.',
    'Create an Instagram caption for a photo of a street market.',
    'Write a Twitter thread recounting a awkward date story.',
    'Draft a Facebook post about a power washing satisfying video.',
    'Write a LinkedIn post about why you left a high-paying job.',
    'Create an Instagram caption for a photo of a DIY craft project.',
    'Write a tweet sharing a controversial take on tipping culture.',
    'Draft a Facebook post about a free community event (movie in the park).',
    'Write a LinkedIn post about the future of remote work tools.',
    'Create an Instagram caption for a photo of a colorful drink.',
    'Write a Twitter thread sharing your journaling prompts.',
    'Draft a Facebook post asking for car repair advice.',
    'Write a LinkedIn post about how to handle a counteroffer.',
    'Create an Instagram caption for a photo of a bridge or city skyline.',
    'Write a tweet sharing a weird phobia you have.',
    'Draft a Facebook post about a great teacher you had.',
    'Write a LinkedIn post about the importance of documentation.',
    'Create an Instagram caption for a photo of a carnival or fair.',
    'Write a Twitter thread sharing tips for flying with a pet.',
    'Draft a Facebook post asking for rainy day activity ideas for kids.',
    'Write a LinkedIn post about crunch culture in game development.',
    'Create an Instagram caption for a "no makeup" makeup selfie.',
    'Write a tweet sharing a two-sentence horror story.',
    'Draft a Facebook post about a local farmer’s market.',
    'Write a LinkedIn post about the best way to cold email someone.',
    'Create an Instagram caption for a photo of a empty street at night.',
    'Write a Twitter thread sharing your process for learning a new skill.',
    'Draft a Facebook post asking for mattress buying advice.',
    'Write a LinkedIn post about the role of luck in success.',
    'Create an Instagram caption for a photo of a waterfall.',
    'Write a tweet sharing a pet peeve about public behavior.',
    'Draft a Facebook post about a successful yard sale.',
    'Write a LinkedIn post about how to fire someone with dignity.',
    'Create an Instagram caption for a photo of a morning run.',
    'Write a Twitter thread sharing your favorite Spotify playlists.',
    'Draft a Facebook post asking for help with a crossword puzzle clue.',
    'Write a LinkedIn post about the skills gap in the workforce.',
    'Create an Instagram caption for a photo of a desert landscape.',
    'Write a tweet sharing a memory triggered by a smell.',
    'Draft a Facebook post about fostering a rescue animal.',
    'Write a LinkedIn post about the benefits of a 4-day work week (evidence).',
    'Create an Instagram caption for a photo of a broken phone screen.',
    'Write a Twitter thread sharing your packing hacks for travel.',
    'Draft a Facebook post about a DIY car repair success.',
    'Write a LinkedIn post about how to network when you are introverted.',
    'Create an Instagram caption for a photo of a handwritten letter.',
    'Write a tweet sharing an observation about human behavior.',
    'Draft a Facebook post about a memorable dream location.',
    'Write a LinkedIn post about quiet quitting vs. quiet firing.',
    'Create an Instagram caption for a photo of a foggy morning.',
    'Write a Twitter thread sharing the best advice your parent gave you.',
    'Draft a Facebook post asking for help choosing a paint color.',
    'Write a LinkedIn post about the importance of rest during job search.',
    'Create an Instagram caption for a photo of a city at night.',
    'Write a tweet sharing a satisfying customer service win.',
    'Draft a Facebook post about a broken appliance you fixed yourself.',
    'Write a LinkedIn post about the dangers of perfectionism.',
    'Create an Instagram caption for a photo of a fruit or vegetable garden.',
    'Write a Twitter thread sharing your experience with online dating.',
    'Draft a Facebook post asking for advice on a teenage child issues.',
    'Write a LinkedIn post about what makes a good team player.',
    'Create an Instagram caption for a photo of a mountain peak.',
    'Write a tweet sharing a small act of kindness you witnessed.',
    'Draft a Facebook post about a subscription you want to cancel.',
    'Write a LinkedIn post about transitioning to a new industry.',
    'Create an Instagram caption for a photo of a crowded train or subway.',
    'Write a Twitter thread sharing your favorite childhood cartoons.',
    'Draft a Facebook post asking for low-carb meal ideas.',
    'Write a LinkedIn post about how to deal with ageism at work.',
    'Create an Instagram caption for a photo of a sleeping pet.',
    'Write a tweet sharing a regret you have from high school.',
    'Draft a Facebook post about a noisy rooster in the neighborhood.',
    'Write a LinkedIn post about the importance of a cover letter.',
    'Create an Instagram caption for a photo of your watch or jewelry.',
    'Write a Twitter thread sharing your tips for staying hydrated.',
    'Draft a Facebook post asking for ways to make extra cash.',
    'Write a LinkedIn post about the rise of the "portfolio career".'
],
        creative: [
    'Describe a mysterious door you found in the forest.',
    'Write a short story starting with: "The package arrived without a return address."',
    'Compose a poem about the feeling of autumn rain.',
    'Write a dialogue between two strangers on a train.',
    'Describe a world where gravity works in reverse one day a week.',
    'Write a story about a librarian who can read books before they are written.',
    'Compose a haiku about a city street at 3 AM.',
    'Write a monologue for a villain who thinks they are the hero.',
    'Describe a color that does not exist in the real world.',
    'Write a short story about a clock that counts down to something unknown.',
    'Compose a poem from the perspective of a stray cat.',
    'Write a dialogue between a hacker and the AI they are trying to break.',
    'Describe a house that is slightly larger on the inside than the outside.',
    'Write a story about a tattoo that moves and changes over time.',
    'Compose a sonnet about the first cup of coffee in the morning.',
    'Write a fight scene using only sounds (onomatopoeia).',
    'Describe a museum where all exhibits are from the future.',
    'Write a story starting with: "The last person on Earth sat alone in a room. There was a knock on the door."',
    'Compose a poem about a forgotten toy in an attic.',
    'Write a dialogue between a ghost and the new homeowner.',
    'Describe a meal that tastes like memories.',
    'Write a story about a child who can talk to machines.',
    'Compose a villanelle about the ocean.',
    'Write a letter from a dying star to a newborn planet.',
    'Describe a carnival where the games are rigged by magic.',
    'Write a story about a door that only opens if you tell it a secret.',
    'Compose a poem about the silence after a fireworks display.',
    'Write a dialogue between two rival street artists at night.',
    'Describe a book that reads the reader instead.',
    'Write a story about a gardener who grows emotions instead of plants.',
    'Compose a limerick about a clumsy wizard.',
    'Write a scene where two people are having an argument entirely in text messages.',
    'Describe a forest where sounds are visible as colors.',
    'Write a story about a piano that plays itself at midnight.',
    'Compose a poem about a key that fits no lock.',
    'Write a dialogue between a therapist and a robot.',
    'Describe a rainstorm where every drop is a different temperature.',
    'Write a story starting with: "He remembered his future perfectly, but his past was a blur."',
    'Compose an elegy for a dying language.',
    'Write a scene in a waiting room where time passes differently for each person.',
    'Describe a photograph that changes every time you look away.',
    'Write a story about a thief who steals only bad memories.',
    'Compose a poem about the smell of old books.',
    'Write a dialogue between a sailor and a siren who lost her voice.',
    'Describe a city built on the back of a sleeping giant.',
    'Write a story about a pair of glasses that show how people will die.',
    'Compose a free verse poem about a broken bicycle.',
    'Write a monologue for a scarecrow at midnight.',
    'Describe a mirror that shows your parallel self.',
    'Write a story about a chef who cooks for ghosts.',
    'Compose a poem about a moth drawn to a flame (from the moth’s perspective).',
    'Write a dialogue between a time traveler and their past self.',
    'Describe a snowstorm that whispers secrets.',
    'Write a story about a watchmaker who stops time for one hour every day.',
    'Compose a concrete poem (shaped like a tree) about growth.',
    'Write a scene where someone is trying to lie to a polygraph that is also a person.',
    'Describe a river that flows upstream at night.',
    'Write a story starting with: "The flowers were singing again, and that meant trouble."',
    'Compose a poem about static electricity.',
    'Write a dialogue between two elevator doors that open to different dimensions.',
    'Describe a bakery that sells feelings as pastries.',
    'Write a story about a deaf composer in a world of loud music.',
    'Compose a pantoum about a train journey.',
    'Write a scene at a border crossing between life and death.',
    'Describe a lighthouse that shines darkness instead of light.',
    'Write a story about a shadow that develops its own personality.',
    'Compose a poem about a loose button on a coat.',
    'Write a dialogue between a prisoner and the jail cell itself.',
    'Describe a festival where people celebrate the day the sun didn’t rise.',
    'Write a story about a tailor who sews dreams into clothing.',
    'Compose an acrostic poem using the word "M I S T A K E".',
    'Write a scene from a dating show where contestants are deities from mythology.',
    'Describe a wound that heals into a different scar every morning.',
    'Write a story about a child who finds a door in the backyard that leads to yesterday.',
    'Compose a poem about the sound of a light bulb burning out.',
    'Write a dialogue between a professional mourner and a widow.',
    'Describe a library where the books scream if you mistreat them.',
    'Write a story about a painter whose paintings are always 5 minutes ahead of reality.',
    'Compose a riddle poem (like a riddle in verse form).',
    'Write a scene in an underground market selling emotions.',
    'Describe a taxi driver who only drives to places that no longer exist.',
    'Write a story starting with: "The algorithm predicted our breakup, so we stayed together out of spite."',
    'Compose a poem about a crack in the sidewalk.',
    'Write a dialogue between a robot vacuum and a toaster at night.',
    'Describe a planet where the inhabitants have no bones.',
    'Write a story about a photographer who captures the moment before death.',
    'Compose a triolet about a forgotten promise.',
    'Write a scene where someone apologizes using only gestures.',
    'Describe a well that echoes sounds from the future.',
    'Write a story about a detective who solves crimes that haven’t happened yet.',
    'Compose a poem about a bubble popping.',
    'Write a dialogue between a tree and the axe that will cut it down.',
    'Describe a bedroom where the furniture rearranges itself overnight.',
    'Write a story about a musician who sold their hearing for fame.',
    'Compose a sestina about a road trip cut short.',
    'Write a scene in a restaurant where the food judges the eater.',
    'Describe a mask that cannot be removed and slowly becomes the face.',
    'Write a story about a lighthouse keeper on a sea of sand.',
    'Compose a poem about the last piece of a puzzle.',
    'Write a dialogue between two punctuation marks (? and !).',
    'Describe a war fought with silence instead of bombs.',
    'Write a story starting with: "She could taste lies, and his were honey-flavored."',
    'Compose a poem about the shadow of a cloud.',
    'Write a scene where a cat gives a human advice.',
    'Describe a circus where the audience is the spectacle.',
    'Write a story about a gardener who grows a human from a seed.',
    'Compose a ghazal about a departing train.',
    'Write a dialogue between a mirror and a photograph.',
    'Describe a storm where the lightning writes words in the sky.',
    'Write a story about a thief who steals only silence.',
    'Compose a poem about a rusty nail.',
    'Write a scene from the perspective of a mannequin in a store window.',
    'Describe a school where students learn to forget.',
    'Write a story about a tailor who makes invisibility cloaks that only work for 5 seconds.',
    'Compose a ballad about a ghost ship.',
    'Write a dialogue between a lock and a key that hate each other.',
    'Describe a vending machine that dispenses regrets.',
    'Write a story about a clock that ticks backwards on birthdays.',
    'Compose a poem about a single hair on a pillow.',
    'Write a scene on a bus where no one speaks the same language but they all laugh at the same joke.',
    'Describe a door that leads exactly 3 feet to the left.',
    'Write a story about an astronaut who lands on a planet and realizes it is Earth from the past.',
    'Compose a poem about the reflection on a spoon.',
    'Write a dialogue between a cloud and a mountain.',
    'Describe a fire that freezes things instead of burning them.',
    'Write a story starting with: "The vending machine said ‘Are you sure?’ in a gentle voice."',
    'Compose a poem about a loose thread on a sweater.',
    'Write a scene of a silent argument in a library.',
    'Describe a flower that blooms only when someone lies.',
    'Write a story about a carpenter who builds cages for bad dreams.',
    'Compose a rondel about a merry-go-round.',
    'Write a dialogue between a sunrise and a sunset.',
    'Describe a phone booth that calls the previous owner of any object.',
    'Write a story about a tattoo artist who inks memories into skin.',
    'Compose a poem about a cracked teacup.',
    'Write a scene in an elevator stalled between floors.',
    'Describe a map that leads to a place that moves.',
    'Write a story about a girl who could hear the color blue.',
    'Compose a poem about a spent match.',
    'Write a dialogue between a winter coat and a pair of sandals in a closet.',
    'Describe a choir where all the singers are invisible.',
    'Write a story starting with: "The earthquake revealed a staircase going down..."',
    'Compose a poem about the pause between heartbeats.',
    'Write a scene where someone tries to return a gift to a god.',
    'Describe a market where people trade their yawns.',
    'Write a story about a blind painter who paints with sound.',
    'Compose an ode to a puddle after rain.',
    'Write a dialogue between two books arguing on a shelf.',
    'Describe a weapon that heals whoever it strikes.',
    'Write a story about a thief who regrets everything they ever stole.',
    'Compose a poem about a fallen eyelash.',
    'Write a scene in a hotel room with a talking minibar.',
    'Describe a scientist who invents a lie that becomes true.',
    'Write a story about a king who traded his kingdom for a single strawberry.',
    'Compose a poem about a skipping stone.',
    'Write a dialogue between a candle and the dark.',
    'Describe a party where everyone is wearing a mask of the same face.',
    'Write a story about a child who draws a door and it opens.',
    'Compose a poem about a bent paperclip.',
    'Write a scene on a submarine that discovers a city of bronze.',
    'Describe a law that makes forgetting illegal.',
    'Write a story about a clockmaker who builds a heart.',
    'Compose a poem about the creak of a floorboard.',
    'Write a dialogue between a scarecrow and a crow.',
    'Describe a color that is jealous of other colors.',
    'Write a story starting with: "The last library burned, and the ashes smelled like vanilla."',
    'Compose a poem about a broken zipper.',
    'Write a scene in a courtroom where the judge is a parrot.',
    'Describe a rain that makes things grow backwards.',
    'Write a story about a musician who plays the silence between notes.',
    'Compose a poem about a foghorn in the distance.',
    'Write a dialogue between a new year and an old year.',
    'Describe a mirror that shows you 10 seconds into the future (which is useless).',
    'Write a story about a gardener who grows keys in the soil.',
    'Compose a poem about a burnt piece of toast.',
    'Write a scene in an asylum where the walls are made of jelly.',
    'Describe a river that sounds like a human voice.',
    'Write a story about a painter whose paint is made of crushed stars.',
    'Compose a poem about a sock lost in a dryer.',
    'Write a dialogue between a mountain and a glacier.',
    'Describe a festival of lights where light is edible.',
    'Write a story about a librarian who organizes books by color and chaos ensues.',
    'Compose a poem about a pencil stub.',
    'Write a scene at a funeral for a refrigerator.',
    'Describe a compass that points to whatever you have lost most recently.',
    'Write a story about a tailor who mends broken hearts with fabric.',
    'Compose a poem about a dripping faucet.',
    'Write a dialogue between a sunrise and a moonrise.',
    'Describe a fruit that tastes like nostalgia.',
    'Write a story starting with: "The doorknob turned, but there was no one there."',
    'Compose a poem about static on a TV screen.',
    'Write a scene in a submarine of air (flying submarine).',
    'Describe a species of bird that nests in human hair.',
    'Write a story about a sculptor who carves temporary statues from smoke.',
    'Compose a poem about the last slice of bread.',
    'Write a dialogue between a volcano and an island.',
    'Describe a weapon that makes people laugh uncontrollably.',
    'Write a story about a detective who only takes cases involving ghosts.',
    'Compose a poem about a scratch on a CD.',
    'Write a scene at a factory that makes dreams for sale.',
    'Describe a clock that chimes in smells instead of sounds.',
    'Write a story about a thief who returns everything they stole plus interest.',
    'Compose a poem about a smudge on a window.',
    'Write a dialogue between a train and its tracks.',
    'Describe a planet where the sky is solid ground.',
    'Write a story about a chef who only cooks what people dream about.',
    'Compose a poem about a squeaky wheel.',
    'Write a scene in a library where books read people.'
],
        daily: [
    'Describe your perfect weekend morning routine.',
    'Write a review of the last movie you watched.',
    'Explain how to cook your favorite dish to a friend.',
    'Write a message to a friend rescheduling your coffee meeting.',
    'Describe your commute to work or school in detail.',
    'Write a packing list for a 3-day beach vacation.',
    'Explain how you fix a bad mood using specific steps.',
    'Write a thank you card to a neighbor who took in your package.',
    'Describe the worst haircut you ever had.',
    'Write a grocery list for a week of healthy eating.',
    'Explain your morning skincare or grooming routine.',
    'Write a message to a landlord reporting a broken dishwasher.',
    'Describe what is currently in your bag or backpack.',
    'Write a review of a book you could not finish.',
    'Explain how to parallel park to a nervous new driver.',
    'Write a short diary entry about a boring Tuesday.',
    'Describe the inside of your refrigerator right now.',
    'Write a message to a friend asking to borrow a suitcase.',
    'Explain your system for organizing digital photos.',
    'Write a note to your future self to read in 5 years.',
    'Describe a dream you remember vividly from last night.',
    'Write a pros and cons list for adopting a cat vs. a dog.',
    'Explain how to make your bed like a hotel.',
    'Write a message to a coworker asking them to turn down the music.',
    'Describe the view from the nearest window to you.',
    'Write a review of the last restaurant you ate at (good or bad).',
    'Explain how you budget your monthly paycheck.',
    'Write a note to your past self apologizing for a mistake.',
    'Describe the most useless gadget you ever bought.',
    'Write a list of 10 things that make you happy.',
    'Explain how to change a flat tire step by step.',
    'Write a message to a friend explaining why you are late.',
    'Describe the smell of your grandparents’ house.',
    'Write a review of a podcast episode you loved.',
    'Explain how you take a perfect nap without feeling groggy.',
    'Write a note to a family member reminding them to take medicine.',
    'Describe the contents of your junk drawer.',
    'Write a list of 5 things you want to learn this year.',
    'Explain how to apologize properly to a partner.',
    'Write a message to a neighbor asking them to collect your mail.',
    'Describe your first memory from childhood.',
    'Write a Yelp review for a gas station bathroom (realistic).',
    'Explain your process for cleaning a room from top to bottom.',
    'Write a note to yourself with three goals for today.',
    'Describe the sound of rain on a metal roof.',
    'Write a message to a friend asking for a ride to the airport.',
    'Explain how you make your morning coffee or tea ritual.',
    'Write a review of the last concert you attended.',
    'Describe a recurring nightmare you used to have.',
    'Write a list of 10 things you are grateful for today.',
    'Explain how to unclog a drain without chemicals.',
    'Write a note to a partner asking them to pick up milk.',
    'Describe the feeling of stepping into a warm building from the cold.',
    'Write a review of a video game that frustrated you.',
    'Explain your method for folding a fitted sheet.',
    'Write a message to a friend congratulating them on a small win.',
    'Describe the worst gift you ever received.',
    'Write a list of 5 podcasts you recommend to a friend.',
    'Explain how to get rid of hiccups using your weird trick.',
    'Write a note to a roommate about the dishes in the sink.',
    'Describe the taste of your favorite childhood snack.',
    'Write a review of an airline you flew with recently.',
    'Explain how you stay focused while working from home.',
    'Write a message to a friend asking for a recipe they cooked.',
    'Describe the feeling of peeling off a sunburn.',
    'Write a packing list for a winter weekend trip.',
    'Explain how to make a simple scrambled egg perfectly.',
    'Write a note to your mail carrier thanking them.',
    'Describe the worst traffic jam you were ever stuck in.',
    'Write a review of a YouTube channel you binge-watched.',
    'Explain your nighttime wind-down routine before sleep.',
    'Write a message to a friend declining a party invite politely.',
    'Describe the sound of a child laughing hysterically.',
    'Write a letter to your favorite teacher from school.',
    'Explain how to hang a picture frame straight.',
    'Write a note to yourself reminding you of a doctor’s appointment.',
    'Describe the look of a crowded subway at rush hour.',
    'Write a review of a piece of furniture you assembled (pain).',
    'Explain how to remove a red wine stain quickly.',
    'Write a message to a friend apologizing for canceling last minute.',
    'Describe the feeling of finding money in an old jacket pocket.',
    'Write a list of 5 movies that make you cry.',
    'Explain how to make a basic vinaigrette dressing.',
    'Write a note to a neighbor complaining about their barking dog.',
    'Describe the smell of a library or used bookstore.',
    'Write a review of a kitchen gadget that changed your life.',
    'Explain your system for remembering passwords.',
    'Write a message to a friend asking for an honest opinion on an outfit.',
    'Describe the taste of minty toothpaste after orange juice.',
    'Write a packing list for a hospital bag (for having a baby).',
    'Explain how to budget for a large purchase like a TV.',
    'Write a note to yourself about a lesson you learned the hard way.',
    'Describe the feeling of a hug from someone you missed.',
    'Write a review of a tool or app that saves you time.',
    'Explain how to properly sharpen a kitchen knife.',
    'Write a message to a friend checking in on their mental health.',
    'Describe the look of a messy desk vs. a clean desk.',
    'Write a list of 5 things you would tell your 16-year-old self.',
    'Explain how to make a bed with a fitted sheet (the easy way).',
    'Write a note to a family member reminding them of a birthday.',
    'Describe the sound of silence when you expect noise.',
    'Write a review of a subscription box you tried.',
    'Explain how you handle a telemarketer call.',
    'Write a message to a friend recommending a TV show to binge.',
    'Describe the feeling of taking off tight shoes after a long day.',
    'Write a packing list for a camping trip (no gear provided).',
    'Explain how to boil an egg perfectly (soft, medium, hard).',
    'Write a note to yourself about a bad habit to break.',
    'Describe the smell of a campfire on your clothes the next day.',
    'Write a review of a local coffee shop as a regular customer.',
    'Explain how you organize your phone apps.',
    'Write a message to a friend asking them to be your plus-one.',
    'Describe the worst flight delay you experienced.',
    'Write a list of 10 things you can see right now.',
    'Explain how to fix a stripped screw.',
    'Write a note to a coworker thanking them for help.',
    'Describe the feeling of waking up naturally without an alarm.',
    'Write a review of a cleaning product that actually works.',
    'Explain your weekly laundry routine.',
    'Write a message to a friend asking for a favor (small).',
    'Describe the taste of a perfectly ripe peach.',
    'Write a packing list for a business trip (1 night).',
    'Explain how to treat a minor burn at home.',
    'Write a note to yourself about a goal you achieved today.',
    'Describe the sound of a fan running on a hot night.',
    'Write a review of a streaming service interface (good or bad).',
    'Explain how you take notes during a meeting.',
    'Write a message to a friend sharing a funny meme description.',
    'Describe the feeling of finishing a big project.',
    'Write a list of 3 things you are anxious about.',
    'Explain how to properly wash a cast iron pan.',
    'Write a note to a delivery driver with instructions to your door.',
    'Describe the look of a child opening a present.',
    'Write a review of a pens you used for journaling.',
    'Explain your morning stretch or exercise routine.',
    'Write a message to a friend asking to crash on their couch.',
    'Describe the smell of a gas station.',
    'Write a packing list for a picnic in the park.',
    'Explain how to negotiate a price at a flea market.',
    'Write a note to your doctor describing a symptom.',
    'Describe the sound of a cat purring loudly.',
    'Write a review of a dating app (the experience, not the date).',
    'Explain how you untangle Christmas lights.',
    'Write a message to a friend asking for a pep talk before an interview.',
    'Describe the feeling of a cold soda on a hot day.',
    'Write a list of 5 random acts of kindness you can do.',
    'Explain how to make instant ramen better with additions.',
    'Write a note to a neighbor about a lost cat.',
    'Describe the look of a toddler covered in spaghetti.',
    'Write a review of a pair of shoes you wore until they broke.',
    'Explain how you calm down when you are angry.',
    'Write a message to a friend apologizing for drunk texting.',
    'Describe the taste of cold pizza for breakfast.',
    'Write a packing list for a day at an amusement park.',
    'Explain how to wax a car (simple method).',
    'Write a note to yourself about a dream you want to pursue.',
    'Describe the sound of a crowd cheering.',
    'Write a review of a hair product that disappointed you.',
    'Explain how you back up your computer files.',
    'Write a message to a friend asking to borrow a charger.',
    'Describe the feeling of finding a parking spot right away.',
    'Write a list of 5 songs that define your teenage years.',
    'Explain how to fold a t-shirt in 2 seconds (KonMari).',
    'Write a note to a partner about what you want for dinner.',
    'Describe the look of a rainy windowpane.',
    'Write a review of a hotel room that was weird.',
    'Explain how you take a screenshot and find it.',
    'Write a message to a friend asking for help moving a couch.',
    'Describe the smell of new books or new electronics.',
    'Write a packing list for a day hike.',
    'Explain how to make a simple soup from leftovers.',
    'Write a note to your future self about current worries.',
    'Describe the sound of a notification when you are waiting for it.',
    'Write a review of a food delivery order that arrived wrong.',
    'Explain how you keep your plants alive (or fail to).',
    'Write a message to a friend explaining a weird habit you have.',
    'Describe the feeling of being the only one awake in the house.',
    'Write a list of 5 things you would buy if you won a small lottery.',
    'Explain how to change a lightbulb in a tricky fixture.',
    'Write a note to a roommate about eating your food.',
    'Describe the look of a sunrise from your window.',
    'Write a review of a grocery store self-checkout machine.',
    'Explain how you avoid procrastination (specific trick).',
    'Write a message to a friend checking if they got home safe.',
    'Describe the taste of a medicine you hated as a child.',
    'Write a packing list for a gym bag.',
    'Explain how to remove a tick safely.',
    'Write a note to a family member about a chipped plate.',
    'Describe the sound of a thunderstorm approaching.',
    'Write a review of a ride-sharing driver (nice or bad).',
    'Explain how you organize your closet by season.',
    'Write a message to a friend asking for good vibes.',
    'Describe the feeling of stepping on a Lego.',
    'Write a list of 5 movies you can watch over and over.',
    'Explain how to make a grilled cheese sandwich perfectly.',
    'Write a note to your boss about needing a day off.',
    'Describe the look of a freshly mowed lawn.',
    'Write a review of a vitamin or supplement you tried.',
    'Explain how you deal with a papercut.',
    'Write a message to a friend asking for a playlist.',
    'Describe the smell of a bakery in the morning.',
    'Write a packing list for a trip to the beach (no bag, just pockets).',
    'Explain how to chop an onion without crying.',
    'Write a note to yourself about something you keep forgetting.',
    'Describe the sound of a fork scraping a plate.',
    'Write a review of a vending machine item that was stale.',
    'Explain how you save money on groceries.',
    'Write a message to a friend describing a weird stranger you saw.',
    'Describe the feeling of taking a first sip of water when thirsty.'
]

    };
    const goal = document.getElementById('goal-select').value;
    const list = topics[goal] || topics.business;
    currentTopic = list[Math.floor(Math.random() * list.length)];
    document.getElementById('topic-text').textContent = currentTopic;
    document.getElementById('essay-input').focus();
});

// Подсчёт слов
document.getElementById('essay-input').addEventListener('input', (e) => {
    const count = e.target.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    document.getElementById('word-count').textContent = count + ' слов';
});

// Спринт
document.getElementById('sprint-btn').addEventListener('click', function() {
    const btn = this;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        btn.textContent = '⏱ Спринт 5 мин';
        document.getElementById('timer-display').textContent = '';
        return;
    }
    timerSeconds = 300;
    const display = document.getElementById('timer-display');
    timerInterval = setInterval(() => {
        timerSeconds--;
        const mins = Math.floor(timerSeconds / 60);
        const secs = String(timerSeconds % 60).padStart(2, '0');
        display.textContent = `${mins}:${secs}`;
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            btn.textContent = '⏱ Спринт 5 мин';
            display.textContent = '⏰ Время вышло!';
            document.getElementById('essay-input').disabled = true;
            setTimeout(() => { document.getElementById('essay-input').disabled = false; }, 2000);
        }
    }, 1000);
    btn.textContent = '⏹ Стоп';
});

// Сохранение текста и АВТОМАТИЧЕСКИЙ АНАЛИЗ
document.getElementById('save-text-btn').addEventListener('click', async () => {
    const essayText = document.getElementById('essay-input').value.trim();
    if (!essayText || !currentTopic) {
        alert('Пожалуйста, сгенерируйте тему и напишите текст.');
        return;
    }
    const wordCount = essayText.split(/\s+/).filter(w => w.length > 0).length;
    
    // Сохраняем в Supabase
    const { error } = await window.supabaseClient.from('essays').insert({
        user_id: currentUser.id,
        goal: document.getElementById('goal-select').value,
        topic: currentTopic,
        content: essayText,
        word_count: wordCount
    });

    if (error) {
        alert('Ошибка сохранения: ' + error.message);
        return;
    }

    alert('Текст сохранён и проанализирован!');
    
    // Очищаем поле и обновляем интерфейс
    document.getElementById('essay-input').value = '';
    document.getElementById('word-count').textContent = '0 слов';
    document.getElementById('text-stats').innerHTML = `<p><strong>📝 Слов:</strong> ${wordCount}</p><p><strong>📊 Символов:</strong> ${essayText.length}</p>`;
    
    // Автоматический анализ чек-листа
    autoAnalyzeChecklist(essayText);
    await loadHistory();
    await loadStats();
});

// Автоматический анализ по критериям
function autoAnalyzeChecklist(text) {
        // Получаем текущую тему
    const topicText = document.getElementById('topic-text').textContent;
    const isTopicGenerated = topicText !== 'Нажмите "Сгенерировать", чтобы начать' && topicText !== 'Нажмите "Сгенерировать"';
    const checklistItems = document.querySelectorAll('#quick-checklist li');
    const lowerText = text.toLowerCase();
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    // Делаем статичным
    document.getElementById('quick-checklist').classList.add('static');
    
    // 7 факторов для быстрого анализа
       const rules = {
        'topic_relevance': {
            check: () => {
                if (!isTopicGenerated) return true; // если тема не сгенерирована — пропускаем
                
                // Извлекаем ключевые слова из темы
                const topicWords = topicText.toLowerCase()
                    .replace(/[.,!?;:'"()]/g, '')
                    .split(/\s+/)
                    .filter(w => w.length > 3) // слова длиннее 3 букв
                    .filter(w => !['write', 'about', 'your', 'that', 'this', 'with', 'from', 'what', 'when', 'where', 'which', 'their', 'there', 'would', 'could', 'should', 'essay', 'letter', 'email', 'post', 'caption', 'describe', 'explain', 'discuss', 'advantages', 'disadvantages', 'agree', 'extent'].includes(w));
                
                // Проверяем, сколько ключевых слов темы есть в тексте
                const matchedWords = topicWords.filter(w => lowerText.includes(w));
                const matchPercentage = topicWords.length > 0 ? matchedWords.length / topicWords.length : 1;
                
                // Также проверяем, что текст не слишком универсальный
                const genericPhrases = ['in conclusion', 'to sum up', 'in my opinion', 'i think', 'i believe', 'firstly', 'secondly', 'finally'];
                const genericCount = genericPhrases.filter(p => lowerText.includes(p)).length;
                const isTooGeneric = genericCount >= 3 && matchedWords.length < 2;
                
                return matchPercentage >= 0.25 && !isTooGeneric;
            },
            yes: '✅ Текст соответствует теме',
            no: '❌ Текст не соответствует теме или слишком общий'
        },
        'introduction': {
            check: () => ['introduction', 'in this essay', 'nowadays', 'recently', 'in recent years', 'it is often said', 'many people believe', 'in today\'s world', 'this essay will', 'the purpose of'].some(p => lowerText.includes(p)) || wordCount > 30,
            yes: '✅ Найдено введение',
            no: '❌ Добавьте вводную фразу'
        },
        'conclusion': {
            check: () => ['in conclusion', 'to sum up', 'to conclude', 'in summary', 'overall', 'all in all', 'finally'].some(p => lowerText.includes(p)),
            yes: '✅ Найдено заключение',
            no: '❌ Добавьте заключение'
        },
        'linking_words': {
            check: () => ['however', 'therefore', 'moreover', 'furthermore', 'nevertheless', 'consequently', 'additionally', 'on the other hand', 'for example', 'such as', 'firstly', 'secondly', 'in addition', 'as a result', 'meanwhile', 'whereas', 'while'].filter(w => lowerText.includes(w)).length >= 2,
            yes: '✅ Слова-связки есть',
            no: '❌ Мало слов-связок'
        },
        'grammar_range': {
            check: () => {
                const hasTenses = /\b(have been|had been|will be|is|are|was|were|has|have|had)\b/i.test(lowerText);
                const hasPassive = /\b(is|are|was|were|has been|have been)\s+\w+(ed|en)\b/i.test(lowerText) || /\b(is|are|was|were)\s+(made|done|taken|built|written)\b/i.test(lowerText);
                const hasConditional = /\bif\b/i.test(lowerText) && /\bwould|will|could\b/i.test(lowerText);
                const hasModals = /\b(can|could|may|might|must|should|shall|will|would)\b/i.test(lowerText);
                const score = [hasTenses, hasPassive, hasConditional, hasModals].filter(Boolean).length;
                return score >= 2;
            },
            yes: '✅ Разнообразие грамматики',
            no: '❌ Используйте разные времена, пассив, модальные глаголы'
        },
        'vocabulary': {
            check: () => {
                const uniqueWords = [...new Set(lowerText.split(/\s+/))].length;
                const academicWords = ['significant', 'therefore', 'consequently', 'furthermore', 'nevertheless', 'moreover', 'demonstrate', 'indicate', 'suggest', 'analyze', 'establish', 'conduct', 'implement', 'acquire', 'relevant', 'sufficient', 'considerable', 'predominantly', 'subsequently', 'thus', 'hence'];
                const academicCount = academicWords.filter(w => lowerText.includes(w)).length;
                return uniqueWords >= 15 && academicCount >= 1;
            },
            yes: '✅ Лексика разнообразна',
            no: '❌ Расширьте словарный запас'
        },
        'structure': {
            check: () => {
                const paragraphs = text.split(/\n\n+/).length;
                const hasIntro = ['introduction', 'in this essay', 'nowadays', 'recently'].some(p => lowerText.includes(p)) || text.substring(0, 100).length > 50;
                const hasBody = paragraphs >= 2;
                const hasConc = ['in conclusion', 'to sum up', 'overall', 'finally'].some(p => lowerText.includes(p)) || text.substring(text.length - 100).length > 50;
                return (hasIntro && hasBody) || (hasBody && hasConc);
            },
            yes: '✅ Логичная структура',
            no: '❌ Разделите на введение, основную часть, заключение'
        },
        'style': {
            check: () => {
                const noSlang = !/\b(wanna|gonna|gotta|dunno|yeah|nah|okay|cool|stuff|thingy|kinda|sorta)\b/i.test(lowerText);
                const noContractions = !/\b(don't|doesn't|isn't|aren't|wasn't|weren't|can't|couldn't|won't|wouldn't|shouldn't|it's|he's|she's|you're|we're|they're|i'm|i've|you've|we've|they've)\b/i.test(lowerText);
                const formalStyle = noSlang && noContractions;
                return formalStyle;
            },
            yes: '✅ Формальный стиль',
            no: '❌ Избегайте сокращений и сленга'
        }
    };
    
    let passedCount = 0;
    let analysisHTML = '';
    
    checklistItems.forEach(item => {
        const criterion = item.dataset.criterion;
        const rule = rules[criterion];
        if (rule) {
            const passed = rule.check();
            if (passed) {
                passedCount++;
                item.className = 'checked';
                item.innerHTML = '✅ ' + item.textContent.replace('✓ ', '').replace('✅ ', '').replace('❌ ', '');
                analysisHTML += `<p style="margin:4px 0;font-size:13px;color:var(--success);">${rule.yes}</p>`;
            } else {
                item.className = 'failed';
                item.innerHTML = '❌ ' + item.textContent.replace('✓ ', '').replace('✅ ', '').replace('❌ ', '');
                analysisHTML += `<p style="margin:4px 0;font-size:13px;color:var(--danger);">${rule.no}</p>`;
            }
        }
    });
    
    const overallScore = Math.round((passedCount / 8) * 100);
    
    document.getElementById('text-stats').innerHTML = `
        <p><strong>📝 Слов:</strong> ${wordCount}</p>
        <p><strong>📊 Символов:</strong> ${text.length}</p>
        <p><strong>⭐ Общая оценка:</strong> ${overallScore}% (${passedCount}/8)</p>
        <div style="margin-top:12px;">${analysisHTML}</div>
    `;
    
        if (!userEssays.find(e => e.content === text)) {
        userEssays.push({ 
            content: text, 
            topic: currentTopic,  // <-- сохраняем тему
            date: new Date().toISOString(),
            goal: document.getElementById('goal-select').value
        });
    }
}
// ========== ИСТОРИЯ ==========
async function loadHistory() {
    if (!currentUser) return;
    const { data, error } = await window.supabaseClient.from('essays').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(10);
    const div = document.getElementById('history-list');
    if (error || !data || data.length === 0) {
        div.innerHTML = '<p class="placeholder-box">Пока нет сохранённых текстов.</p>';
        return;
    }
    let html = '<table class="history-table"><thead><tr><th>Дата</th><th>Тема</th><th>Цель</th><th>Слов</th></tr></thead><tbody>';
    data.forEach(e => {
        html += `<tr><td>${new Date(e.created_at).toLocaleDateString('ru')}</td><td>${e.topic.substring(0, 50)}...</td><td>${e.goal}</td><td>${e.word_count}</td></tr>`;
    });
    html += '</tbody></table>';
    div.innerHTML = html;
}

// ========== СТАТИСТИКА ==========
async function loadStats() {
    if (!currentUser) return;
    const { data } = await window.supabaseClient.from('essays').select('word_count, created_at').eq('user_id', currentUser.id);
    const container = document.getElementById('profile-stats');
    if (!container) return;
    
    const totalTexts = data ? data.length : 0;
    const totalWords = data ? data.reduce((sum, e) => sum + (e.word_count || 0), 0) : 0;
    const avgWords = totalTexts > 0 ? Math.round(totalWords / totalTexts) : 0;
    
    // Подсчёт streak (дней подряд)
    let streak = 0;
    if (data && data.length > 0) {
        const dates = [...new Set(data.map(e => new Date(e.created_at).toDateString()))].sort().reverse();
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (dates[0] === today || dates[0] === yesterday) {
            streak = 1;
            for (let i = 1; i < dates.length; i++) {
                const prev = new Date(dates[i-1]);
                const curr = new Date(dates[i]);
                if ((prev - curr) / 86400000 === 1) streak++;
                else break;
            }
        }
    }
    
    container.innerHTML = `
        <div class="stat-card"><div class="stat-value">${totalTexts}</div><div class="stat-label">Текстов</div></div>
        <div class="stat-card"><div class="stat-value">${totalWords}</div><div class="stat-label">Всего слов</div></div>
        <div class="stat-card"><div class="stat-value">${avgWords}</div><div class="stat-label">Слов/текст</div></div>
        <div class="stat-card"><div class="stat-value">${streak || '—'}</div><div class="stat-label">Дней подряд</div></div>
    `;
}

// ========== ДЕТАЛЬНЫЙ ЧЕК-ЛИСТ ==========
function renderDetailedChecklist() {
    const container = document.getElementById('detailed-checklist');
    
    if (!userEssays || userEssays.length === 0) {
        container.innerHTML = '<p class="placeholder-box">Сначала сохраните текст в Тренажёре, чтобы увидеть полный анализ.</p>';
        return;
    }
    
    const lastEssay = userEssays[userEssays.length - 1].content;
    const lowerText = lastEssay.toLowerCase();
    const wordCount = lastEssay.trim().split(/\s+/).filter(w => w.length > 0).length;
    const sentences = lastEssay.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;
    const uniqueWords = [...new Set(lowerText.split(/\s+/))].length;
    
    const articleCount = (lowerText.match(/\b(the|a|an)\b/g) || []).length;
    const prepositionCount = (lowerText.match(/\b(in|on|at|by|for|with|from|to|of|about|into|upon|within|during|between|among|through|over|under|above|below)\b/gi) || []).length;
    const modalCount = (lowerText.match(/\b(can|could|may|might|must|shall|should|will|would|ought to|have to|need to)\b/gi) || []).length;
    const linkerCount = (lowerText.match(/\b(however|therefore|moreover|furthermore|nevertheless|consequently|additionally|meanwhile|whereas|while|although|though|because|since|unless|if|when|then|also|besides|in addition|as a result|for example|for instance|such as|on the other hand|in contrast|similarly|likewise|hence|thus|accordingly)\b/gi) || []).length;
    const passiveCount = (lowerText.match(/\b(is|are|was|were|has been|have been|will be|had been|being|been)\s+\w+(ed|en|d|t)\b/gi) || []).length;
    const complexSentenceCount = (lowerText.match(/\b(which|who|whom|whose|that|where|when|while|although|though|because|since|if|unless|whereas|whereby)\b/gi) || []).length;
    const academicWords = ['significant', 'therefore', 'consequently', 'furthermore', 'nevertheless', 'moreover', 'demonstrate', 'indicate', 'suggest', 'analyze', 'establish', 'conduct', 'implement', 'acquire', 'relevant', 'sufficient', 'considerable', 'predominantly', 'subsequently', 'thus', 'hence', 'whereas', 'notwithstanding', 'whereby', 'therein'];
    const academicCount = academicWords.filter(w => lowerText.includes(w)).length;
    const hasContractions = /\b(don't|doesn't|isn't|aren't|wasn't|weren't|can't|couldn't|won't|wouldn't|shouldn't|it's|he's|she's|you're|we're|they're|i'm)\b/i.test(lowerText);
    const hasSlang = /\b(wanna|gonna|gotta|dunno|yeah|nah|okay|cool|stuff|thingy|kinda|sorta)\b/i.test(lowerText);

    const criteria = [
        { 
            cat: '🎯 Соответствие заданию',
            items: [
                { 
                    name: 'Текст соответствует теме', 
                    check: () => {
                        const topicFromPage = document.getElementById('topic-text')?.textContent || '';
                        const lastTopic = (userEssays.length > 0 && userEssays[userEssays.length - 1].topic) 
                            ? userEssays[userEssays.length - 1].topic 
                            : topicFromPage;
                        if (!lastTopic || lastTopic.includes('Нажмите') || lastTopic.includes('Сгенерировать')) return true;
                        const topicWords = lastTopic.toLowerCase().replace(/[.,!?;:'"()]/g, '').split(/\s+/).filter(w => w.length > 3).filter(w => !['write', 'about', 'your', 'that', 'this', 'with', 'from', 'what', 'when', 'where', 'which', 'their', 'there', 'would', 'could', 'should', 'essay', 'letter', 'email', 'post', 'caption', 'describe', 'explain', 'discuss', 'advantages', 'disadvantages', 'agree', 'extent'].includes(w));
                        const matchedWords = topicWords.filter(w => lowerText.includes(w));
                        return topicWords.length === 0 || matchedWords.length >= Math.ceil(topicWords.length * 0.25);
                    } 
                },
                { 
                    name: 'Раскрыты все аспекты темы', 
                    check: () => {
                        const topicFromPage = document.getElementById('topic-text')?.textContent || '';
                        const lastTopic = (userEssays.length > 0 && userEssays[userEssays.length - 1].topic) 
                            ? userEssays[userEssays.length - 1].topic 
                            : topicFromPage;
                        if (!lastTopic || lastTopic.includes('Нажмите') || lastTopic.includes('Сгенерировать')) return true;
                        const topicWords = lastTopic.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !['write', 'about', 'your', 'that', 'this', 'with'].includes(w));
                        const matched = topicWords.filter(w => lowerText.includes(w));
                        return topicWords.length <= 3 || matched.length >= 2;
                    }
                },
                { 
                    name: 'Нет отхода от темы', 
                    check: () => {
                        const genericOnly = /\b(in conclusion|to sum up|in my opinion|i think|firstly|secondly|finally|moreover|furthermore)\b/gi;
                        const genericMatches = (lowerText.match(genericOnly) || []).length;
                        return genericMatches < wordCount * 0.15;
                    }
                }
            ]
        },
        { 
            cat: '📝 Структура и организация', 
            items: [
                { name: 'Чёткое введение', check: () => ['introduction', 'in this essay', 'nowadays', 'recently'].some(p => lowerText.includes(p)) || wordCount > 30 },
                { name: 'Основная часть (аргументы)', check: () => wordCount > 50 && sentences.length >= 3 },
                { name: 'Заключение', check: () => ['in conclusion', 'to sum up', 'overall', 'to conclude'].some(p => lowerText.includes(p)) },
                { name: 'Разделение на абзацы', check: () => lastEssay.split(/\n\n+/).length >= 2 },
                { name: 'Логическая последовательность', check: () => linkerCount >= 2 },
                { name: 'Достаточный объём (50+ слов)', check: () => wordCount >= 50 }
            ]
        },
        {
            cat: '🔤 Грамматика',
            items: [
                { name: 'Разнообразие времён', check: () => /\b(have been|had been|will be|was|were|am|are|is|has|have|had)\b/i.test(lowerText) },
                { name: 'Пассивный залог', check: () => passiveCount >= 1 },
                { name: 'Условные предложения', check: () => /\bif\b/i.test(lowerText) && /\bwould|will|could|might\b/i.test(lowerText) },
                { name: 'Модальные глаголы', check: () => modalCount >= 1 },
                { name: 'Правильные артикли', check: () => articleCount >= wordCount * 0.02 },
                { name: 'Разнообразие предлогов', check: () => prepositionCount >= 3 }
            ]
        },
        {
            cat: '📚 Лексика и словарный запас',
            items: [
                { name: 'Академическая лексика', check: () => academicCount >= 2 },
                { name: 'Синонимы (нет повторов)', check: () => uniqueWords >= wordCount * 0.6 },
                { name: 'Слова-связки', check: () => linkerCount >= 3 },
                { name: 'Коллокации и устойчивые выражения', check: () => /\b(in terms of|on the other hand|as a result|in order to|due to the fact|it is important to|take into account|play a role|make a difference|bear in mind)\b/i.test(lowerText) },
                { name: 'Нет разговорных выражений', check: () => !hasSlang }
            ]
        },
        {
            cat: '🎨 Стиль и оформление',
            items: [
                { name: 'Формальный тон', check: () => !hasSlang && !hasContractions },
                { name: 'Нет сокращений', check: () => !hasContractions },
                { name: 'Сложные предложения', check: () => complexSentenceCount >= 2 },
                { name: 'Разнообразие структур', check: () => avgWordsPerSentence >= 8 && avgWordsPerSentence <= 25 },
                { name: 'Орфография (базовая проверка)', check: () => !/\b(teh|adn|thier|recieve|occured|seperate|definately|goverment|begining|accomodate|wich|alot)\b/i.test(lowerText) },
                { name: 'Пунктуация', check: () => /[.,!?;:'"]/.test(lastEssay) && lastEssay.split(/[.!?]+/).length >= 3 },
                { name: 'Заглавные буквы', check: () => lastEssay[0] === lastEssay[0]?.toUpperCase() && !/[a-z]\s+[A-Z]/.test(lastEssay.substring(1)) },
                { name: 'Нет повторяющихся ошибок', check: () => uniqueWords >= 10 }
            ]
        }
    ];
    
    let totalPassed = 0;
    let totalItems = 0;
    
    let html = '';
    criteria.forEach(cat => {
        html += `<div class="card"><h4>${cat.cat}</h4><ul class="checklist static">`;
        cat.items.forEach(item => {
            totalItems++;
            const passed = item.check();
            if (passed) totalPassed++;
            const cls = passed ? 'checked' : 'failed';
            const icon = passed ? '✅' : '❌';
            html += `<li class="${cls}">${icon} ${item.name}</li>`;
        });
        html += '</ul></div>';
    });
    
    const overallPercentage = Math.round((totalPassed / totalItems) * 100);
    let overallLevel;
    if (overallPercentage >= 90) overallLevel = 'Отлично! (Band 7.5-8.0)';
    else if (overallPercentage >= 75) overallLevel = 'Хорошо (Band 6.5-7.0)';
    else if (overallPercentage >= 60) overallLevel = 'Средне (Band 5.5-6.0)';
    else if (overallPercentage >= 40) overallLevel = 'Ниже среднего (Band 4.5-5.0)';
    else overallLevel = 'Требует улучшения (Band <4.5)';
    
    html = `
        <div style="text-align:center;margin-bottom:24px;padding:20px;background:var(--primary-light);border-radius:12px;">
            <h3 style="margin:0;">📊 Общий результат: ${overallPercentage}%</h3>
            <p style="margin:4px 0;font-size:16px;font-weight:600;">${overallLevel}</p>
            <p style="margin:0;font-size:13px;color:var(--text-secondary);">${totalPassed} из ${totalItems} критериев выполнено</p>
        </div>
        <div class="grid grid-2">${html}</div>
    `;
    
    container.innerHTML = html;
}
// ========== СЛОВАРЬ ОШИБОК (САМООБУЧАЮЩИЙСЯ) ==========
function renderPersonalDictionary() {
    const container = document.getElementById('personal-dictionary');
    const errorPatterns = [
        { regex: /\bI am (doctor|teacher|engineer|student)\b/gi, wrong: 'I am doctor', correct: 'I am a doctor', category: 'Артикли' },
        { regex: /\barrived to (the|a|an)?\s*\w+/gi, wrong: 'arrived to Moscow', correct: 'arrived in Moscow', category: 'Предлоги' },
        { regex: /\b(I|he|she|it|we|they) very much (like|love|hate|enjoy)\b/gi, wrong: 'I very much like coffee', correct: 'I like coffee very much', category: 'Порядок слов' },
        { regex: /\bdiscuss about\b/gi, wrong: 'discuss about the problem', correct: 'discuss the problem', category: 'Грамматика' },
        { regex: /\b(suggest|recommend|propose) (him|her|them|me|you) to\b/gi, wrong: 'suggest him to go', correct: 'suggest that he go / suggest going', category: 'Конструкции' },
        { regex: /\b(furniture|information|advice|news|homework)s\b/gi, wrong: 'furnitures, informations', correct: 'furniture, information (без s)', category: 'Мн.число' },
        { regex: /\b(go to shop|go to gym|go to school|go to hospital)\b/gi, wrong: 'go to shop', correct: 'go to the shop', category: 'Артикли' },
    ];
    
    // Подсчёт частоты ошибок на основе текстов пользователя
    let errorFrequency = {};
    if (userEssays.length > 0) {
        userEssays.forEach(essay => {
            errorPatterns.forEach(pattern => {
                if (pattern.regex.test(essay.content)) {
                    const key = pattern.correct;
                    errorFrequency[key] = (errorFrequency[key] || 0) + 1;
                }
            });
        });
    }
    
    // Сортировка по частоте и выбор топ-15
    const sortedErrors = Object.entries(errorFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    let html = '';
    if (sortedErrors.length === 0) {
        html = '<p class="placeholder-box">Недостаточно данных. Напишите больше текстов, чтобы увидеть свои частые ошибки.</p>';
    } else {
        sortedErrors.forEach(([key, count], index) => {
            const pattern = errorPatterns.find(p => p.correct === key);
            if (pattern) {
                html += `
                <div class="error-card card">
                    <span><strong>#${index + 1}</strong> (${count} раз(а))</span>
                    <p style="margin-top:8px;"><span class="wrong">✗ ${pattern.wrong}</span></p>
                    <p><span class="correct">✓ ${pattern.correct}</span></p>
                    <small style="color:var(--text-muted);">Категория: ${pattern.category}</small>
                </div>`;
            }
        });
    }
    container.innerHTML = html;
}

// ========== ТЕСТ НА УРОВЕНЬ (рендер) ==========
function renderLevelTest() {
    const container = document.getElementById('level-test-container');
    if (!container) return;
    
    container.innerHTML = `
        <p>Тест из 50 вопросов для точного определения уровня (A1–C2).</p>
        <div id="test-area">
            <div id="question-text" style="font-size:18px;margin-bottom:24px;"></div>
            <div id="options-container"></div>
            <div style="margin-top:24px;display:flex;justify-content:space-between;align-items:center;">
                <span id="progress-indicator">Вопрос 1/50</span>
                <button id="next-question-btn" class="btn btn-primary" disabled>Далее →</button>
            </div>
        </div>
        <div id="test-result" style="display:none; text-align:center;"></div>
    `;
    
    // Вопросы теста
    window.testQuestions = [
        { q: 'Choose the correct sentence:', opts: ['She walk to work every day.', 'She walks to work every day.', 'She walking to work every day.'], answer: 1 },
        { q: 'What is the past form of "go"?', opts: ['Went', 'Gone', 'Goed'], answer: 0 },
        { q: 'Find the correct preposition: "I usually wake up ___ 7 AM."', opts: ['in', 'at', 'on'], answer: 1 },
        { q: 'Choose the correct question:', opts: ['Where you live?', 'Where do you live?', 'Where does you live?'], answer: 1 },
        { q: 'Complete: "There ___ three apples on the table."', opts: ['is', 'am', 'are'], answer: 2 },
        { q: 'Choose the meaning of "must" in this sentence: "You must stop at a red light."', opts: ['It is a good idea', 'It is a rule / necessary', 'It is optional'], answer: 1 },
        { q: 'Plural form of "child":', opts: ['Childs', 'Children', 'Childes'], answer: 1 },
        { q: 'Complete: "Yesterday I ___ a very interesting movie."', opts: ['see', 'saw', 'seen'], answer: 1 },
        { q: 'Choose the correct negative sentence:', opts: ['He doesn\'t like coffee.', 'He don\'t like coffee.', 'He not like coffee.'], answer: 0 },
        { q: 'Complete: "My sister is ___ than me."', opts: ['more tall', 'taller', 'the tallest'], answer: 1 },
        { q: 'Complete: "I ___ never ___ to Japan before this trip."', opts: ['did / go', 'have / been', 'was / went'], answer: 1 },
        { q: 'Choose the correct conditional: "If we leave now, we ___ on time."', opts: ['arrive', 'would arrive', 'will arrive'], answer: 2 },
        { q: 'Passive voice: "The building ___ in 1890."', opts: ['built', 'was built', 'is build'], answer: 1 },
        { q: 'Gerund or infinitive? "I can\'t afford ___ a new car right now."', opts: ['buy', 'to buy', 'buying'], answer: 1 },
        { q: 'Complete: "She is very good ___ mathematics."', opts: ['in', 'at', 'for'], answer: 1 },
        { q: 'Choose the correct second conditional: "If I ___ you, I would apologise."', opts: ['am', 'were', 'was'], answer: 1 },
        { q: 'Present perfect or past simple? "I ___ my homework already."', opts: ['did', 'have done', 'do'], answer: 1 },
        { q: 'Complete: "He suggested ___ to the cinema instead of staying home."', opts: ['to go', 'going', 'go'], answer: 1 },
        { q: 'Choose the correct preposition: "She insisted ___ paying for the meal."', opts: ['on', 'in', 'at'], answer: 0 },
        { q: 'Third conditional: "If she had studied, she ___ the exam."', opts: ['would pass', 'would have passed', 'passed'], answer: 1 },
        { q: 'Complete: "The report ___ by the assistant yesterday afternoon."', opts: ['was written', 'wrote', 'has written'], answer: 0 },
        { q: 'Choose the correct meaning: "I used to smoke."', opts: ['I smoked regularly in the past but not now', 'I am smoking now', 'I will smoke in the future'], answer: 0 },
        { q: 'Complete: "She warned him ___ touching the wet paint."', opts: ['about', 'for', 'against'], answer: 2 },
        { q: 'Choose the correct sentence with "enough":', opts: ['He is enough tall to reach it.', 'He is tall enough to reach it.', 'He is tall to reach enough.'], answer: 1 },
        { q: 'Complete: "By the time we arrived, the movie ___."', opts: ['started', 'had started', 'has started'], answer: 1 },
        { q: 'Choose the correct future form: "Look at those clouds! It ___ rain."', opts: ['will', 'is going to', 'might to'], answer: 1 },
        { q: 'Complete: "He is responsible ___ managing the entire project."', opts: ['for', 'of', 'with'], answer: 0 },
        { q: 'Choose the correct question tag: "You like pizza, ___?"', opts: ['do you', 'don\'t you', 'are you'], answer: 1 },
        { q: 'Complete: "Stop ___ so much noise! The baby is sleeping."', opts: ['to make', 'make', 'making'], answer: 2 },
        { q: 'Choose the correct passive: "People speak Spanish in 20 countries." → "Spanish ___ in 20 countries."', opts: ['speaks', 'is spoken', 'is speaking'], answer: 1 },
        { q: 'Complete: "Not only ___ the exam, but she also got the highest score."', opts: ['did she pass', 'she passed', 'passed she'], answer: 0 },
        { q: 'Choose the correct subjunctive: "I wish I ___ taller when I played basketball."', opts: ['am', 'were', 'was'], answer: 1 },
        { q: 'Complete: "Had I known about the traffic, I ___ a different route."', opts: ['would take', 'would have taken', 'took'], answer: 1 },
        { q: 'Causative form: "I need to ___ my phone ___ as the screen is cracked."', opts: ['have / repair', 'get / to repair', 'have / repaired'], answer: 2 },
        { q: 'Choose the correct inversion: "Under no circumstances ___ the door after midnight."', opts: ['you should open', 'should you open', 'you open'], answer: 1 },
        { q: 'Mixed conditional: "If he were more experienced, he ___ that mistake yesterday."', opts: ['wouldn\'t make', 'wouldn\'t have made', 'didn\'t make'], answer: 1 },
        { q: 'Complete with the correct idiom: "He finally broke the ice at the party by telling a joke." What does "broke the ice" mean?', opts: ['Started a fight', 'Made everyone feel more relaxed', 'Left early'], answer: 1 },
        { q: 'Choose the correct form: "It\'s high time you ___ a decision."', opts: ['make', 'made', 'have made'], answer: 1 },
        { q: 'Complete: "No sooner ___ he left the house than the phone rang."', opts: ['had', 'did', 'was'], answer: 0 },
        { q: 'Choose the correct collocation: "The company faced a ___ crisis after the scandal."', opts: ['big', 'large', 'major'], answer: 2 },
        { q: 'Complete: "She came ___ a lot of money after her grandmother passed away."', opts: ['into', 'across', 'over'], answer: 0 },
        { q: 'Choose the correct subjunctive: "The lawyer recommended that the contract ___ signed immediately."', opts: ['be', 'is', 'will be'], answer: 0 },
        { q: 'Complete: "Much ___ he tried, he could not convince the board to approve his proposal."', opts: ['as', 'despite', 'although'], answer: 0 },
        { q: 'Choose the correct inversion: "Seldom ___ such a beautiful sunset in the city."', opts: ['I have seen', 'have I seen', 'I saw'], answer: 1 },
        { q: 'Complete: "His remarks were ___ insensitive to the situation."', opts: ['totally', 'utterly', 'highly'], answer: 1 },
        { q: 'Choose the correct mixed conditional: "If she had taken the job, she ___ living in London right now."', opts: ['would be', 'would have been', 'is'], answer: 0 },
        { q: 'Causative form: "The famous actor had the reporters ___ him a second time."', opts: ['interview', 'to interview', 'interviewed'], answer: 0 },
        { q: 'Complete the idiom: "She decided to bite the bullet and tell the truth." What does "bite the bullet" mean?', opts: ['Avoid a difficult situation', 'Face a difficult situation bravely', 'Cause a problem for others'], answer: 1 },
        { q: 'Choose the correct option: "Such ___ the demand for tickets that the website crashed."', opts: ['was', 'is', 'were'], answer: 0 },
        { q: 'Complete: "I would rather you ___ smoke in the car, please."', opts: ['don\'t', 'didn\'t', 'won\'t'], answer: 1 }
    ];
    
    let currentQ = 0;
    let score = 0;
    
    function showQuestion() {
        if (currentQ >= window.testQuestions.length) {
            const total = window.testQuestions.length;
            const percentage = (score / total) * 100;
            
            let level;
            if (percentage >= 90) level = 'C2';
            else if (percentage >= 75) level = 'C1';
            else if (percentage >= 60) level = 'B2';
            else if (percentage >= 40) level = 'B1';
            else if (percentage >= 20) level = 'A2';
            else level = 'A1';
            
            if (currentUser) {
                window.supabaseClient.auth.updateUser({
                    data: { english_level: level }
                }).then(() => {
                    console.log('Уровень обновлён:', level);
                });
            }
            
            document.getElementById('test-area').style.display = 'none';
            document.getElementById('test-result').style.display = 'block';
            document.getElementById('test-result').innerHTML = `
                <h2>Ваш уровень: ${level}</h2>
                <p>Правильных ответов: ${score}/${total}</p>
                <p>Процент точности: ${Math.round(percentage)}%</p>
                <p style="color:var(--success);">✅ Уровень сохранён в профиле!</p>
                <button class="btn btn-primary" onclick="showSection('levels')">Пройти заново</button>
            `;
            return;
        }
        
        const q = window.testQuestions[currentQ];
        document.getElementById('question-text').textContent = q.q;
        const optsContainer = document.getElementById('options-container');
        optsContainer.innerHTML = '';
        q.opts.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'test-option';
            btn.textContent = opt;
            btn.onclick = () => {
                document.querySelectorAll('.test-option').forEach(b => b.disabled = true);
                if (i === q.answer) {
                    btn.classList.add('correct-answer');
                    score++;
                } else {
                    btn.classList.add('wrong-answer');
                    optsContainer.children[q.answer].classList.add('correct-answer');
                }
                document.getElementById('next-question-btn').disabled = false;
            };
            optsContainer.appendChild(btn);
        });
        document.getElementById('progress-indicator').textContent = `Вопрос ${currentQ + 1}/${window.testQuestions.length}`;
        document.getElementById('next-question-btn').disabled = true;
    }
    
    document.getElementById('next-question-btn').addEventListener('click', () => {
        currentQ++;
        showQuestion();
    });
    
    showQuestion();
}

// ========== ПРОФИЛЬ ==========
async function renderProfile() {
    if (!currentUser) return;
    
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (user) currentUser = user;
    
    const info = document.getElementById('profile-info');
    const userData = currentUser.user_metadata || {};
    
    const levelNames = {
        'A1': 'Начинающий (Beginner)',
        'A2': 'Элементарный (Elementary)',
        'B1': 'Средний (Intermediate)',
        'B2': 'Выше среднего (Upper-Intermediate)',
        'C1': 'Продвинутый (Advanced)',
        'C2': 'Владение в совершенстве (Proficiency)'
    };
    const levelCode = userData.english_level || 'Не указан';
    const levelName = levelNames[levelCode] || levelCode;
    
    const goalNames = {
        'business': 'Деловая переписка',
        'ielts_academic': 'IELTS Academic',
        'ielts_general': 'IELTS General',
        'social': 'Социальные сети',
        'creative': 'Творческое письмо',
        'daily': 'Повседневное общение'
    };
    const goalName = goalNames[userData.goal] || userData.goal || 'Не указана';
    
    const genderName = userData.gender === 'male' ? 'Мужской' : userData.gender === 'female' ? 'Женский' : 'Не указан';
    const birthYear = userData.birth_year || '—';
    const age = birthYear !== '—' ? new Date().getFullYear() - parseInt(birthYear) : '—';
    const regDate = new Date(currentUser.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
    
    info.innerHTML = `
        <div style="display:flex;align-items:center;gap:20px;margin-bottom:20px;">
            <div style="width:70px;height:70px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;font-size:32px;color:#fff;font-weight:700;">
                ${(userData.first_name || 'U')[0].toUpperCase()}
            </div>
            <div>
                <h3 style="margin:0;">${userData.first_name || 'Пользователь'} ${userData.last_name || ''}</h3>
                <p style="color:var(--text-secondary);margin:4px 0;">${currentUser.email}</p>
            </div>
        </div>
        <hr style="border-color:var(--border);margin:20px 0;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div><strong>Пол:</strong> ${genderName}</div>
            <div><strong>Возраст:</strong> ${age}</div>
            <div><strong>Год рождения:</strong> ${birthYear}</div>
            <div><strong>Дата регистрации:</strong> ${regDate}</div>
            <div style="grid-column:1/-1;background:var(--primary-light);padding:12px;border-radius:8px;">
                <strong>🎯 Уровень английского:</strong> <span style="font-size:18px;font-weight:700;color:var(--primary);">${levelName}</span>
            </div>
            <div style="grid-column:1/-1;background:var(--bg);padding:12px;border-radius:8px;">
                <strong>📚 Цель обучения:</strong> ${goalName}
            </div>
        </div>
    `;
    await loadStats();
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
window.onload = () => {
    window.supabaseClient.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            currentUser = user;
            navigateTo('dashboard');
        }
    });
};