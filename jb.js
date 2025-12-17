/* Learnixis site JS
	 - Navigation between sections
	 - Theme (dark/light) toggle
	 - Mock login
	 - Course details modal
	 - Synonyms/Antonyms dataset (300 generated entries) with search + pagination
	 - Grammar game with question generator
	 - 50 conversation situations generator
	 - Profile save/load to localStorage
*/
(function(){
	const qs = s => document.querySelector(s);
	const qsa = s => Array.from(document.querySelectorAll(s));

	/* ---------- Navigation ---------- */
	function showPage(id){
		qsa('.page').forEach(p=>p.classList.remove('active'));
		const el = qs('#'+id);
		if(el) el.classList.add('active');
		window.scrollTo({top:0,behavior:'smooth'});
	}

	qsa('.nav button[data-target], .btn[data-target]').forEach(btn=>{
		btn.addEventListener('click',e=>{
			const t = btn.getAttribute('data-target');
			if(t) showPage(t);
		});
	});

	/* ---------- Theme ---------- */
	const themeToggle = qs('#themeToggle');
	function setTheme(light){
		if(light) document.documentElement.classList.add('light');
		else document.documentElement.classList.remove('light');
		localStorage.setItem('learnixis_theme', light? 'light':'dark');
		themeToggle.textContent = light ? '🌞' : '🌙';
	}
	themeToggle.addEventListener('click',()=> setTheme(!document.documentElement.classList.contains('light')));
	// load theme
	setTheme(localStorage.getItem('learnixis_theme') === 'light');

	/* ---------- Login (mock) ---------- */
	qs('#loginForm').addEventListener('submit',e=>{
		e.preventDefault();
		const email = qs('#email').value.trim();
		const pass = qs('#password').value.trim();
		if(!email || !pass) return alert('Provide credentials');
		localStorage.setItem('lx_user', JSON.stringify({email, name: email.split('@')[0]}));
		alert('Login successful — welcome back!');
		showPage('welcome');
	});
	qs('#guestBtn').addEventListener('click',()=>{
		localStorage.removeItem('lx_user');
		showPage('welcome');
	});

	/* ---------- Course details modal ---------- */
	const modal = qs('#courseDetail');
	qsa('[data-course]').forEach(b=>b.addEventListener('click',e=>{
		const c = b.getAttribute('data-course');
		qs('#cd-title').textContent = c[0].toUpperCase()+c.slice(1)+' Course';
		qs('#cd-desc').textContent = {
			beginner:'A gentle start — basics of grammar, listening and practical words.',
			intermediate:'Conversation, grammar expansion, and practice tasks.',
			advanced:'Fluency drills, nuance, idioms, and advanced writing.'
		}[c]||'Course details.';
		modal.classList.remove('hidden');
	}));
	modal.querySelector('.close').addEventListener('click',()=>modal.classList.add('hidden'));

	/* ---------- Synonyms & Antonyms data (generate 300 entries) ---------- */
	const seed = [
		{w:'happy',syn:['joyful','pleased'],ant:['sad','unhappy']},
		{w:'big',syn:['large','huge'],ant:['small','tiny']},
		{w:'fast',syn:['quick','rapid'],ant:['slow']},
		{w:'smart',syn:['bright','clever'],ant:['dumb','stupid']},
		{w:'easy',syn:['simple','straightforward'],ant:['hard','difficult']},
		{w:'start',syn:['begin','commence'],ant:['stop','end']},
		{w:'strong',syn:['powerful','sturdy'],ant:['weak']},
		{w:'clean',syn:['tidy','neat'],ant:['dirty','messy']},
		{w:'brave',syn:['courageous','valiant'],ant:['cowardly','timid']},
		{w:'rich',syn:['wealthy','affluent'],ant:['poor']},
		{w:'bright',syn:['luminous','vivid'],ant:['dull','dim']},
		{w:'calm',syn:['peaceful','serene'],ant:['agitated','angry']},
		{w:'cold',syn:['chilly','freezing'],ant:['hot','warm']},
		{w:'hot',syn:['warm','boiling'],ant:['cold']},
		{w:'old',syn:['ancient','aged'],ant:['young','new']},
		{w:'new',syn:['fresh','recent'],ant:['old']},
		{w:'quiet',syn:['silent','hushed'],ant:['loud','noisy']},
		{w:'early',syn:['premature','ahead'],ant:['late']},
		{w:'late',syn:['tardy','delayed'],ant:['early']},
		{w:'hard',syn:['difficult','tough'],ant:['easy']},
		{w:'soft',syn:['gentle','plush'],ant:['hard']},
		{w:'clean',syn:['sanitary','spotless'],ant:['dirty']},
		{w:'laugh',syn:['giggle','chuckle'],ant:['cry']},
		{w:'love',syn:['adore','cherish'],ant:['hate']},
		{w:'ask',syn:['inquire','question'],ant:['answer','reply']},
		{w:'answer',syn:['reply','respond'],ant:['ask']},
		{w:'win',syn:['triumph','prevail'],ant:['lose']},
		{w:'lose',syn:['fail','miss'],ant:['win']},
		{w:'full',syn:['filled','sated'],ant:['empty']},
		{w:'empty',syn:['vacant','hollow'],ant:['full']}
	];

	const synant = [];
	for(let i=0;i<300;i++){
		const s = seed[i % seed.length];
		const idx = Math.floor(i/seed.length)+1;
		synant.push({
			word: s.w + (idx>1? ' ('+idx+')':''),
			synonyms: s.syn,
			antonyms: s.ant
		});
	}

	// SynAnt UI
	let saPage = 1, saPer = 12;
	function renderSA(){
		const list = qs('#saList'); list.innerHTML='';
		const filter = qs('#saFilter').value;
		const q = qs('#saSearch').value.trim().toLowerCase();
		const filtered = synant.filter(it=>{
			if(q && !it.word.toLowerCase().includes(q)) return false;
			if(filter==='syn' && (!it.synonyms || it.synonyms.length===0)) return false;
			if(filter==='ant' && (!it.antonyms || it.antonyms.length===0)) return false;
			return true;
		});
		const pages = Math.max(1, Math.ceil(filtered.length / saPer));
		saPage = Math.min(saPage, pages);
		const start = (saPage-1)*saPer; const pageItems = filtered.slice(start, start+saPer);
		pageItems.forEach(it=>{
			const d = document.createElement('div'); d.className='sa-item';
			d.innerHTML = `<strong>${it.word}</strong>\n+        <div class='muted'>Synonyms: ${it.synonyms.join(', ')}</div>\n+        <div class='muted'>Antonyms: ${it.antonyms.join(', ')}</div>`;
			list.appendChild(d);
		});
		qs('#pageInfo').textContent = `Page ${saPage} / ${pages} — ${filtered.length} result(s)`;
	}
	qs('#saSearch').addEventListener('input',()=>{saPage=1;renderSA()});
	qs('#saFilter').addEventListener('change',()=>{saPage=1;renderSA()});
	qs('#prevPage').addEventListener('click',()=>{saPage=Math.max(1,saPage-1);renderSA()});
	qs('#nextPage').addEventListener('click',()=>{saPage=saPage+1;renderSA()});
	renderSA();

	/* ---------- Grammar game generator ---------- */
	const grammarTemplates = [
		{q:'Choose the correct form: I ___ to the store yesterday.',c:['go','went','gone'],'a':1},
		{q:'Choose: She ___ already finished her homework.',c:['have','has','had'],'a':1},
		{q:'Pick correct: He ___ swimming every Sunday.',c:['go','goes','gone'],'a':1},
		{q:'Which is correct? They ___ been there before.',c:['has','have','had'],'a':1},
		{q:'Fill: If I ___ you, I would apologize.',c:['am','was','were'],'a':2},
		{q:'Choose: She asked ___ I was coming.',c:['if','that','when'],'a':0},
		{q:'Pick: He is better ___ math than me.',c:['at','in','on'],'a':0},
		{q:'Choose: I look forward ___ your reply.',c:['to','for','at'],'a':0},
		{q:'Which is right? He ___ to finish it by noon.',c:['planning','plans','plan'],'a':1},
		{q:'Correct: I ___ him for years.',c:['know','knew','have known'],'a':2}
	];

	// generate more by cycling templates
	const gameQ = [];
	for(let i=0;i<100;i++){
		const t = grammarTemplates[i % grammarTemplates.length];
		gameQ.push(Object.assign({},t));
	}

	let gIndex = 0, gScore = 0, gPlaying=false;
	function startGame(){ gIndex=0; gScore=0; gPlaying=true; showQuestion(); qs('#gameScore').textContent = '' }
	function showQuestion(){
		const q = gameQ[gIndex];
		qs('#question').textContent = `Q${gIndex+1}. ${q.q}`;
		const choices = qs('#choices'); choices.innerHTML='';
		q.c.forEach((ch,i)=>{
			const b = document.createElement('button'); b.className='choice'; b.textContent = ch;
			b.addEventListener('click',()=>{
				if(!gPlaying) return;
				if(i===q.a){ b.classList.add('correct'); gScore++; }
				else b.classList.add('wrong');
				// show correct highlight
				Array.from(choices.children).forEach((c,ci)=>{ if(ci===q.a) c.classList.add('correct') });
			});
			choices.appendChild(b);
		});
	}
	qs('#startGame').addEventListener('click',()=>{ startGame(); });
	qs('#nextQ').addEventListener('click',()=>{
		if(!gPlaying) return; gIndex++;
		if(gIndex>=gameQ.length){ gPlaying=false; qs('#gameScore').textContent = `Finished — Score: ${gScore} / ${gameQ.length}`; }
		else showQuestion();
	});

	/* ---------- Conversations generator (50) ---------- */
	const convoSeeds = [
		'At a cafe','Asking for directions','Booking a hotel','Job interview','At the airport','Shopping for clothes','Ordering food','Visiting a doctor','Making small talk','Asking for help'
	];
	const convos = [];
	for(let i=0;i<50;i++){
		const title = convoSeeds[i % convoSeeds.length] + ' — #' + (i+1);
		const a = `A: Example line for situation ${i+1}.`;
		const b = `B: Response example for ${i+1}.`;
		convos.push({title,dialog:[a,b]});
	}
	function renderConvos(){
		const el = qs('#convoList'); el.innerHTML='';
		convos.forEach(c=>{
			const d = document.createElement('div'); d.className='convo';
			d.innerHTML = `<strong>${c.title}</strong><div class='muted'>${c.dialog.join('<br>')}</div>`;
			el.appendChild(d);
		});
	}
	renderConvos();

	/* ---------- Profile ---------- */
	const profileForm = qs('#profileForm');
	profileForm.addEventListener('submit',e=>{
		e.preventDefault();
		const name = qs('#pname').value.trim();
		const bio = qs('#pbio').value.trim();
		const level = qs('#plevel').value;
		const p = {name,bio,level};
		localStorage.setItem('lx_profile', JSON.stringify(p));
		showProfile();
		alert('Profile saved');
	});
	qs('#resetProfile').addEventListener('click',()=>{ localStorage.removeItem('lx_profile'); profileForm.reset(); showProfile(); });
	function showProfile(){
		const p = JSON.parse(localStorage.getItem('lx_profile')||'null');
		if(p){ qs('#profileCard').classList.remove('hidden'); qs('#pc-name').textContent=p.name; qs('#pc-bio').textContent=p.bio; qs('#pc-level').textContent=p.level; }
		else qs('#profileCard').classList.add('hidden');
	}
	showProfile();

	// small accessibility: allow nav by hash
	if(location.hash){ const id = location.hash.replace('#',''); if(qs('#'+id)) showPage(id); }

})();

