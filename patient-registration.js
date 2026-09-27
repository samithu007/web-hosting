// MediFlow — Patient Registration / Edit Form
// Kept separate so the registration workflow is easy to find and maintain.
function setFieldState(el,valid,required=false,msg=''){if(!el)return;el.classList.remove('field-valid','field-invalid');const old=el.parentElement?.querySelector('.field-error');if(old)old.remove();if(!el.value){if(required){el.classList.add('field-invalid');const e=document.createElement('small');e.className='field-error';e.textContent=msg||'This field is required';el.parentElement?.appendChild(e);}return;}if(valid)el.classList.add('field-valid');else{el.classList.add('field-invalid');const e=document.createElement('small');e.className='field-error';e.textContent=msg||'Invalid value';el.parentElement?.appendChild(e);}}
function openPatientRegistration(existingId=null){
 const existing=existingId?DB.getPatient(existingId):null, isEdit=!!existing;
 openModal(isEdit?'Edit patient':'Create patient account',`<div class="alert info">${isEdit?'Update patient details. NIC is optional. If provided, DOB and gender are derived from the NIC.':'NIC is optional. If you enter a valid NIC, DOB and gender will be filled automatically.'}</div>
 <div class="form-grid">
 <label>Full name<input id="rName" value="${esc(existing?.name||'')}" placeholder="Kasun Silva"></label>
 <label>NIC <span class="field-hint" id="nicHint">Optional</span><input id="rNic" value="${esc(existing?.nic||'')}" placeholder="200012345678 or 991234567V"></label>
 <label>Mobile number<input id="rPhone" value="${esc(existing?.phone||'')}" placeholder="07XXXXXXXX"></label>
 <label>Email<input id="rEmail" type="email" value="${esc(existing?.email||'')}" placeholder="you@example.com"></label>
 <label>Date of birth<input id="rDob" type="date" value="${esc(existing?.dob||'')}"></label>
 <label>Gender<select id="rGender"><option value="">Select gender</option><option value="Male" ${existing?.gender==='Male'?'selected':''}>Male</option><option value="Female" ${existing?.gender==='Female'?'selected':''}>Female</option></select></label>
 <label>Address<input id="rAddress" value="${esc(existing?.address||'')}" placeholder="Your address"></label>
 ${isEdit?'':'<label>Username<input id="rUser" placeholder="patient123"></label><label>Password<input id="rPass" type="password" placeholder="At least 8 characters"></label><label>Confirm password<input id="rPass2" type="password" placeholder="Re-enter password"></label>'}
 <label>Emergency contact name<input id="rEmergencyName" value="${esc(existing?.emergencyName||'')}"></label>
 <label>Emergency contact phone<input id="rEmergencyPhone" value="${esc(existing?.emergencyPhone||'')}" placeholder="07XXXXXXXX"></label>
 </div>`,`<button class="small-btn" id="clearRegistration">Clear</button><button class="small-btn" data-close>Cancel</button><button class="primary-btn" id="registerPatient">${isEdit?'Save changes':'Create account'}</button>`);
 const syncIdentity=()=>{const dob=$('#rDob').value;const nic=$('#rNic').value.trim().toUpperCase();if(nic&&nicDetails(nic)){const info=nicDetails(nic);$('#rDob').value=info.dob;$('#rGender').value=info.gender;$('#nicHint').textContent='Valid NIC • DOB & gender auto-filled';}else $('#nicHint').textContent=nic?'Invalid NIC':'Optional';setFieldState($('#rName'),!!$('#rName').value.trim(),true,'Full name is required');setFieldState($('#rPhone'),validatePhone($('#rPhone').value),true,'Enter a valid Sri Lankan mobile number');setFieldState($('#rEmail'),!!$('#rEmail').value.trim()&&$('#rEmail').validity.valid,true,'Enter a valid email');setFieldState($('#rDob'),!!$('#rDob').value,true,'Date of birth is required');setFieldState($('#rGender'),!!$('#rGender').value,true,'Select Male or Female');setFieldState($('#rAddress'),true,false,'');setFieldState($('#rEmergencyPhone'),!$('#rEmergencyPhone').value||validatePhone($('#rEmergencyPhone').value),false,'Enter a valid mobile number');setFieldState($('#rNic'),!nic||!!nicDetails(nic),false,'Enter a valid Sri Lankan NIC');};
 $('#rName').oninput=syncIdentity;$('#rNic').oninput=syncIdentity;$('#rDob').onchange=syncIdentity;$('#rGender').onchange=syncIdentity;$('#rPhone').oninput=syncIdentity;$('#rEmail').oninput=syncIdentity;$('#rAddress').oninput=syncIdentity;$('#rEmergencyPhone').oninput=syncIdentity;syncIdentity();
 $('#clearRegistration').onclick=()=>{$$('#modalRoot input, #modalRoot textarea').forEach(x=>{if(!x.readOnly)x.value=''});$('#rGender').value='';syncIdentity()};
 $('#registerPatient').onclick=()=>{
   const name=$('#rName').value.trim(),nic=$('#rNic').value.trim().toUpperCase(),phone=normalizePhone($('#rPhone').value.trim()),email=$('#rEmail').value.trim(),dob=$('#rDob').value,gender=$('#rGender').value,emergencyPhone=normalizePhone($('#rEmergencyPhone').value.trim());
   const required=[['rName',name,'Full name'],['rPhone',phone,'Mobile number'],['rEmail',email,'Email'],['rDob',dob,'Date of birth'],['rGender',gender,'Gender']];
   const missing=required.find(x=>!x[1]);if(missing){required.forEach(x=>setFieldState($('#'+x[0]),!!x[1],true,`${x[2]} is required`));return toast(`${missing[2]} is required`,'error');}
   if(!validatePhone(phone)){setFieldState($('#rPhone'),false,true,'Enter a valid Sri Lankan mobile number');return toast('Enter a valid Sri Lankan mobile number','error');}
   if(emergencyPhone&&!validatePhone(emergencyPhone)){setFieldState($('#rEmergencyPhone'),false,false,'Enter a valid mobile number');return toast('Enter a valid emergency mobile number','error');}
   const identity=patientIdentityFromFields(nic,dob,gender); if(identity.error){if(nic)setFieldState($('#rNic'),false,false,identity.error);return toast(identity.error,'error');}
   const db=getDB();
   if(db.patients.some(p=>p.id!==existingId&&nic&&String(p.nic||'').toUpperCase()===nic))return toast('NIC is already registered','error');
   if(db.users.some(u=>(u.email||'').toLowerCase()===email.toLowerCase()&&(!existing||u.patientId!==existing.id)))return toast('Email is already registered','error');
   if(isEdit){
     const p=db.patients.find(x=>x.id===existingId);Object.assign(p,{name, nic:identity.nic, phone,email,dob:identity.dob,gender:identity.gender,address:$('#rAddress').value.trim(),emergencyName:$('#rEmergencyName').value.trim(),emergencyPhone});
     const u=db.users.find(x=>x.patientId===existingId);if(u)Object.assign(u,{name,phone,email,nic:identity.nic});saveDB(db);DB.addAudit('Patient profile updated',state.user.role,existingId);closeModal();toast('Patient details updated ✓');render();return;
   }
   const username=$('#rUser').value.trim(),pass=$('#rPass').value;if(!username||!pass)return toast('Username and password are required','error');if(pass.length<8)return toast('Password must be at least 8 characters','error');if(pass!==$('#rPass2').value)return toast('Passwords do not match','error');if(db.users.some(u=>u.username.toLowerCase()===username.toLowerCase()))return toast('Username already exists','error');
   const p=DB.addPatient({name,nic:identity.nic,phone,email,dob:identity.dob,gender:identity.gender,address:$('#rAddress').value.trim(),username,password:pass,emergencyName:$('#rEmergencyName').value.trim(),emergencyPhone});DB.addAudit('Patient registered','self',p.id);closeModal();$('#loginUsername').value=username;$('#loginPassword').value=pass;toast('Patient account registered successfully ✓');
 };
}
