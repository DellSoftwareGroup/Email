<?php
require 'widget.class.php';
require 'Emogrifier.php';

$widget = new Widget();

$toolbar = '';
$useTestData = true;

if (isset($_GET['download'])) {
	$info = pathinfo($_GET['page']);

	header("Content-Type: text/html");
	header("Content-Transfer-Encoding: Ascii");
	header("Content-disposition: attachment; filename=\"{$info['basename']}\"");
}
else if(!isset($_GET['noTools'])) {
	$toolbar = <<<END
<div id="toolbar" style="position: fixed; bottom: 0; right: 0; border: 1px solid #444; padding: 5px; background-color: #c0c0c0;">
	<div>- <a href="javascript;" onclick="document.getElementById('toolbar').remove(); return false;">Hide Toolbar</a></div>
	<div>- <a href="?download">Download File</a></div>
END;

	if (isset($_GET['no-process'])) {
		$toolbar .= '<div>- <a href="?">Inline Processing</a></div>';
		$toolbar .= '<div>- <strong>No Inline Processing</strong></div>';
	} else {
		$toolbar .= '<div>- <strong>Inline Processing</strong></div>';
		$toolbar .= '<div>- <a href="?no-process">No Inline Processing</a></div>';
	}

	$toolbar .= '</div>';
}

if(isset($_GET['testData'])) {
	$useTestData = $_GET['testData'] == 'true' ? true:false;
}

$content = $widget->content($useTestData);

$content = str_replace('</body>', $toolbar . "\n" . '</body>', $content);

echo $content;