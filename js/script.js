/* Client-side logic: load tips from /data/tips.json, render table, support search/filter/sort,
   and provide Add/Edit UI via the <dialog> element. Data is kept in-memory; export to JSON
   is provided for persistence by copying/saving the output.
*/
document.addEventListener('DOMContentLoaded', async ()=>{
  const table = document.getElementById('tips-table');
  const tbody = table.tBodies[0];
  let tips = [];

  const searchInput = document.getElementById('search-input');
  const riskFilter = document.getElementById('risk-filter');
  const categoryFilter = document.getElementById('category-filter');
  const clearBtn = document.getElementById('clear-btn');
  const exportBtn = document.getElementById('export-btn');

  async function loadData(){
    try{
      const res = await fetch('/data/tips.json', {cache:'no-store'});
      if(!res.ok) throw new Error('Failed to fetch data');
      tips = await res.json();
    }catch(err){
      console.warn('Could not load /data/tips.json — using fallback sample', err);
      tips = [];
    }
    renderTable();
  }

  function normalize(s){ return (s||'').toString().toLowerCase(); }

  function renderTable(){
    tbody.innerHTML = '';
    tips.forEach((t)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(t.topic)}</td>
        <td>${escapeHtml(t.category)}</td>
        <td>${riskBadge(t.risk)}</td>
        <td>${escapeHtml(t.description)}</td>
        <td>${escapeHtml(t.actions)}</td>
        <td>${t.resources ? `<a href="${escapeAttr(t.resources)}" target="_blank" rel="noopener">Link</a>` : ''}</td>
      `;
      tbody.appendChild(tr);
    });
    filter();
  }

  function escapeHtml(str){ return String(str||'').replace(/[&<>\"]/g, (c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }
  function escapeAttr(str){ return encodeURI(String(str||'')); }

  function riskBadge(risk){
    const r = normalize(risk || '');
    const cls = r.includes('low') ? 'risk-low' : r.includes('high') ? 'risk-high' : 'risk-moderate';
    return `<span class="badge ${cls}">${escapeHtml(risk||'')}</span>`;
  }

  function matchesRowObj(obj, text, risk, category){
    const hay = [obj.topic, obj.category, obj.risk, obj.description, obj.actions, obj.resources].join(' ').toLowerCase();
    if(text && !hay.includes(text.toLowerCase())) return false;
    if(risk && obj.risk.toLowerCase() !== risk.toLowerCase()) return false;
    if(category && obj.category.toLowerCase() !== category.toLowerCase()) return false;
    return true;
  }

  function filter(){
    const q = searchInput.value.trim();
    const r = riskFilter.value;
    const c = categoryFilter.value;
    Array.from(tbody.rows).forEach((row, i)=>{
      const obj = tips[i];
      if(!obj) { row.style.display='none'; return; }
      row.style.display = matchesRowObj(obj, q, r, c) ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', filter);
  riskFilter.addEventListener('change', filter);
  categoryFilter.addEventListener('change', filter);

  clearBtn.addEventListener('click', ()=>{ searchInput.value=''; riskFilter.value=''; categoryFilter.value=''; filter(); searchInput.focus(); });

  // (edit/add UI removed to prevent public modification)

  // Export JSON
  exportBtn.addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(tips, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'tips-export.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  // Sorting
  const headers = Array.from(table.tHead.querySelectorAll('th'));
  let sortState = {idx:-1,dir:1};

  function compareObj(a,b,idx){
    const keys = ['topic','category','risk','description','actions','resources'];
    const key = keys[idx] || keys[0];
    const av = (a[key]||'').toString().toLowerCase();
    const bv = (b[key]||'').toString().toLowerCase();
    return av.localeCompare(bv);
  }

  headers.forEach((th, idx)=>{
    th.addEventListener('click', ()=>{
      const dir = (sortState.idx===idx) ? -sortState.dir : 1;
      sortState = {idx,dir};
      tips.sort((a,b)=>compareObj(a,b,idx)*dir);
      renderTable();
    });
  });

  // Initial load
  await loadData();

});
