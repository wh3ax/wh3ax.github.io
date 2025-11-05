/* Client-side logic: load tips from /data/tips.json, render table, support search/filter/sort,
   and provide Add/Edit UI via the <dialog> element. Data is kept in-memory; export to JSON
   is provided for persistence by copying/saving the output.
*/
document.addEventListener('DOMContentLoaded', async ()=>{
  const table = document.getElementById('tips-table');
  const tbody = table.tBodies[0];
  let tips = [];

  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const clearBtn = document.getElementById('clear-btn');
  const exportBtn = document.getElementById('export-btn');
  const categoryChipsContainer = document.getElementById('category-chips');

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
        <td>${escapeHtml(t.description)}</td>
        <td>${escapeHtml(t.actions)}</td>
        <td>${t.resources ? `<a href="${escapeAttr(t.resources)}" target="_blank" rel="noopener">Link</a>` : ''}</td>
      `;
      tbody.appendChild(tr);
    });
    filter();
    // Refresh chips selection (if any)
    syncChipsWithSelect();
  }

  function escapeHtml(str){ return String(str||'').replace(/[&<>\"]/g, (c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }
  function escapeAttr(str){ return encodeURI(String(str||'')); }

  function matchesRowObj(obj, text, category){
    const hay = [obj.topic, obj.category, obj.description, obj.actions, obj.resources].join(' ').toLowerCase();
    if(text && !hay.includes(text.toLowerCase())) return false;
    if(category && obj.category.toLowerCase() !== category.toLowerCase()) return false;
    return true;
  }

  function filter(){
    const q = searchInput.value.trim();
    const c = categoryFilter.value;
    let firstVisibleRow = null;
    
    Array.from(tbody.rows).forEach((row, i)=>{
      const obj = tips[i];
      if(!obj) { row.style.display='none'; return; }
      const isVisible = matchesRowObj(obj, q, c);
      row.style.display = isVisible ? '' : 'none';
      if (isVisible && !firstVisibleRow) {
        firstVisibleRow = row;
      }
    });

    // Smooth scroll to first matching result
    if (firstVisibleRow && (q || c)) {
      const tableWrap = document.querySelector('.table-wrap');
      if (tableWrap) {
        tableWrap.scrollTo({
          top: firstVisibleRow.offsetTop - tableWrap.offsetTop - 20,
          behavior: 'smooth'
        });
      }
    }
  }

  searchInput.addEventListener('input', filter);
  categoryFilter.addEventListener('change', filter);

  clearBtn.addEventListener('click', ()=>{ searchInput.value=''; categoryFilter.value=''; filter(); searchInput.focus(); });

  // Clear should also clear chips visual state
  clearBtn.addEventListener('click', ()=>{
    Array.from(document.querySelectorAll('.chip.selected')).forEach(c=>c.classList.remove('selected'));
  });

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
    const keys = ['topic','category','description','actions','resources'];
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

  // Build quick category chips from the <select> options
  function buildCategoryChips(){
    if(!categoryChipsContainer) return;
    categoryChipsContainer.innerHTML = '';
    Array.from(categoryFilter.options).forEach(opt=>{
      if(!opt.value) return; // skip the 'All' option
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.textContent = opt.textContent;
      btn.dataset.value = opt.value;
      btn.addEventListener('click', ()=>{
        // toggle selection
        const isSelected = btn.classList.toggle('selected');
        if(isSelected){
          // set the select and filter
          categoryFilter.value = btn.dataset.value;
        }else{
          categoryFilter.value = '';
        }
        filter();
        // keep only one chip selected at a time
        Array.from(categoryChipsContainer.children).forEach(c=>{ if(c!==btn) c.classList.remove('selected'); });
      });
      categoryChipsContainer.appendChild(btn);
    });
  }

  function syncChipsWithSelect(){
    if(!categoryChipsContainer) return;
    const val = categoryFilter.value || '';
    Array.from(categoryChipsContainer.children).forEach(ch=>{
      if(ch.dataset.value && ch.dataset.value.toLowerCase() === val.toLowerCase()) ch.classList.add('selected');
      else ch.classList.remove('selected');
    });
  }

  // Build chips once the DOM and select exist
  buildCategoryChips();

});
