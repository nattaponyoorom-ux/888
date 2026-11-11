import {api} from '../api.js';
import {node,status} from '../utils.js';
const target=document.getElementById('published');
try { const c=await api.catalog(); target.replaceChildren(node('p',c.scopeNote),node('p',c.contactNote)); }
catch(e) { status(target,e.message); }
