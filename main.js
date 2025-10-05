document.getElementById('leadForm').addEventListener('submit', (e)=>{
e.preventDefault();
// デモ用：実サービスではAPI/FormsにPOST
e.target.hidden = true;
document.getElementById('thanks').hidden = false;
});