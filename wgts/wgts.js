///////////////////////////////////////////////////////////////////////////////
// ux.wgt.DIV
/*
	innerHTML의 편집을 지원하므로

	wgt.setData/getData
		HTML
			(이 위젯은 주로 외부에서 직접 innerHTML하므로 필요는 없느나 기능은 제공함)
*/

var xa = {}

xa.styleMap = {
	title:true
	,visibility:true
	,font:true, fontSize:true
	,alpha:true
	,angle:true
	,dragX:true, dragY:true, dragInParent:true, dragContainParent:true
}

xa.scriptInfo = {
	wgtData:{HTML:{help:{ko:"String\nDIV의 'innerHTML'에 지정할 HTML입니다.",en:"String\nHTML string to be set as 'innerHTML'."}}}
}

xa.editor = {
	iconThumb:'DB/ux/imgs/wgts/thumbs/tag.png'
}

xa.properties = {
	attrs:{
		HTML:''
	}
}

xa.createAsCanvasObject = apn.widgets['apn.wgt.rect'].createAsCanvasObject; //%INFO ADD할 경우가 없으므로 사용되지 않는 함수임
xa.exeRenderTag = apn.widgets['apn.wgt.rect'].exeRenderTag;
xa.exeCreateTag = apn.widgets['apn.wgt.rect'].exeCreateTag;

xa.exeOnLoad = function(apx, oId)
{
	this._htmlSet(apx, oId);

	var _this = this;

	//	HTML set, <body> TAG 및 <head> TAG에 해당하는 HTML를 지정합니다.
	function onSetHTML(changeWgtId, value)
	{
		if (changeWgtId == oId){
			_this._htmlSet(apx, oId);
		}
	}
	apx.wgtListenProperty(oId, 'HTML', onSetHTML);
}

xa.exeOnScreenRefresh = function(apx, oId, opts)
{
	var tag = apx.wgtTag(oId);

	// Text가 있으면 다시 Set함. Virtical Align 경우 Font의 크기에 영향을 받음
	var text, refresh = true;

	if (opts && opts.font && opts.font != apx.wgtGetProperty(oId, 'apxFont', /*Resolve*/true)) refresh = false; // Font가 다르면 Skip

	if (refresh){
		apx.fireEvent('contentChange', 'font', oId, /*always*/true);
	}
}

xa._htmlSet = function(apx, oId)
{
	var html;

	if ((html = apx.wgtGetProperty(oId, 'HTML'))){
		if (!apx.sptExeIsPreview() || apn.Project.getScriptVer(apx.project) == 2){
			apx.wgtTag(oId).innerHTML = html;
		}
		else{
			apx.wgtTag(oId).innerHTML = 'This is supporeted with Aspen Scripting Ver2.';
		}
	}
}

xa.edtOnCheckContentChange = function(prj, pId, oId)
{
	return {font:'Font'};
}

xa.edtOnConfig = function(/*CEditor*/apd, oId)
{
	var buf = {HTML:apd.wgtGetProperty(oId, 'HTML')};
	var tagDlg;

	function onOK1()
	{
		eduLib.edtInputApplyAll(apd, tagDlg);
		apd.wgtSetProperty(oId, 'HTML', buf.HTML);
		//apd.wgtRefreshUI(oId);
	}

	if (tagDlg = apd.dlgDoModal(Math.ceil(bx.UX.width*0.8), 760, onOK1)){
		eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:'HTML', join:true});
		eduLib.edtInputAdd(apd, tagDlg, {type:'text', value:buf, key:'HTML', multiline:true, height:'600px', join:true});
	}
}

uxWgtDIV = xa;
