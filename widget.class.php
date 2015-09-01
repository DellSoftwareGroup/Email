<?php

class Widget
{
    private $css, $html, $comments;

    function __construct()
    {
        $this->css = '';
        $this->html = file_get_contents($_GET['page']);

        $this->parseSubWidget();

        if (preg_match_all('/\<link(.*?)href="(.*?)"\>/', $this->html, $m)) {
            foreach ($m[2] as $indx => $link) {
                if (substr($link, 0, 1) == '/') {
                    $link = 'http://' . $_SERVER['HTTP_HOST'] . $link;
                }

                $this->html = str_replace($m[0][$indx], "<style type=\"text/css\">\n" . file_get_contents($link) . "\n</style>\n", $this->html);
                //$this->html = str_replace($m[0][$indx], '', $this->html);
                //$this->css .= file_get_contents($link);
            }
        }
    }

    function parseSubWidget() {
        $hasVars = false;

        if(preg_match_all("/\[\[widget:(.+)\]\]/", $this->html, $m)) {
            $hasVars = true;

            foreach($m[1] as $indx => $widgetName) {
                if(file_exists(__DIR__ . '/widgets/' . $widgetName . '.htm')) {
                    $this->html = str_replace($m[0][$indx], file_get_contents(__DIR__ . '/widgets/' . $widgetName . '.htm'), $this->html);
                }
                else if(file_exists(__DIR__ . '/widgets/' . $widgetName . '.html')) {
                    $this->html = str_replace($m[0][$indx], file_get_contents(__DIR__ . '/widgets/' . $widgetName . '.html'), $this->html);
                }
                else {
                    $this->html = str_replace($m[0][$indx], '', $this->html);
                }
            }
        }

        if($hasVars) {
            $this->parseSubWidget();
        }
    }

    function emogrifier()
    {
        $this->comments = array();
        $findMatch = array('/<!--<!\[endif\]-->/', '/<!--\[(.*?)\]>/', '/<!\[endif\]-->/', '/<!\[endif\]-->/', '/<!-->/', '/<!--<!\[(.*?)\]-->/');

        foreach ($findMatch as $f) {
            if (preg_match_all($f, $this->html, $m)) {
                foreach ($m[0] as $c) {
                    $replaceWidth = '[[' . $this->getRandomString(16) . ']]';
                    $this->html = str_replace($c, $replaceWidth, $this->html);
                    $this->comments[] = array($replaceWidth, $c);
                }
            }
        }

        //$this->response['comments'] = $this->comments;

        if (preg_match_all("/<style(.*?)>([\w\W]+?)[^<\/style>]<\/style>/", $this->html, $m)) {
            foreach ($m[2] as $indx => $this->cssCode) {
                $this->html = str_replace($m[0][$indx], '', $this->html);
                $this->css .= "\n" . $this->cssCode;
            }
        }

        //$this->response['preprocess'] = $this->html;

        if (preg_match_all("/@charset (.*?);/", $this->css, $m)) {
            foreach ($m[0] as $x) {
                $this->css = str_replace($x, '', $this->css);
            }
        }

        //$this->response['css'] = $this->css;

        $emogrifier = new Emogrifier();
        $emogrifier->setHtml($this->html);
        $emogrifier->setCss($this->css);

        $newHTML = $emogrifier->emogrify();

        foreach ($this->comments as $comment) {
            $newHTML = str_replace($comment[0], $comment[1], $newHTML);
        }

        return $newHTML;
    }

    function getRandomString($length) {
        $ranString = '';
        $alphaLower = array('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z');
        $alphaUpper = array('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');
        $digits = array('0','1','2','3','4','5','6','7','8','9');

        for($i = 0; $i < $length; $i++) {
            $r = mt_rand(0,8);

            if($r >= 0 && $r <= 2) {
                $n = mt_rand(0, 25);
                $ranString .= $alphaLower[$n];
            }
            else if($r >= 3 && $r <= 5) {
                $n = mt_rand(0, 25);
                $ranString .= $alphaUpper[$n];
            }
            else if($r >= 6) {
                $n = mt_rand(0, 9);
                $ranString .= $digits[$n];
            }
        }

        return $ranString;
    }

    function content()
    {
        if(isset($_GET['no-process'])) {
            return $this->html;
        }

        return $this->emogrifier();
    }
}