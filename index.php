<?php
require 'widget.class.php';
require 'Emogrifier.php';

$widget = new Widget();

if (isset($_GET['download'])) {
	$info = pathinfo($_GET['page']);

	header("Content-Type: text/html");
	header("Content-Transfer-Encoding: Ascii");
	header("Content-disposition: attachment; filename=\"{$info['basename']}\"");
}

$toolbar = <<<END
<div style="position: fixed; bottom: 0; right: 0; border: 1px solid #444; padding: 5px; background-color: #c0c0c0;">
	<div>- <a href="?download">Download File</a></div>
END;

if(isset($_GET['no-process'])) {
	$toolbar .= '<div>- <a href="?">Inline Processing</a></div>';
	$toolbar .= '<div>- <strong>No Inline Processing</strong></div>';
}
else {
	$toolbar .= '<div>- <strong>Inline Processing</strong></div>';
	$toolbar .= '<div>- <a href="?no-process">No Inline Processing</a></div>';
}

$toolbar .= '</div>';


$content = $widget->content();

$content = str_replace('</body>', $toolbar, $content);

echo $content;