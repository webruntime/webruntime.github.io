<?php
if (!isset($_GET['action'])) {
  echo '
    <html>
    <body>
    Select User to set cookie<br>
    <a href="video_cookie.php?action=setcookie&user=lge">set user</a>
    <a href="video_cookie.php?action=setcookie&user">set invalid user</a>
    </body>
    </html>
  ';
} else if ($_GET['action'] == 'setcookie') {
    $newURL= dirname($_SERVER['REQUEST_URI']) . '/video_cookie.php?action=view';
    header('Location: '.$newURL);
    setcookie('user', $_GET['user'], time() + 100);
} else if ($_GET['action'] == 'view') {
  header('Cache-Control: no-cache, no-store, must-revalidate');
  echo '
    <html>
        <body>
            <video controls width="800px" height="600px" src="video_cookie.php?action=readfile&file=media/sintel_trailer-1080p.mp4" />
        </body>
    </html>
  ';
} else if ($_GET['action'] === 'readfile') {
  header('Cache-Control: no-cache, no-store, must-revalidate');
  header('Content-Type: video/mp4');
  header('Expires: 0');
    if (isset($_GET['file'])) {
        $file = $_GET['file'];
        if ($_COOKIE["user"] == "lge") {
            $newURL= dirname(dirname($_SERVER['REQUEST_URI'])) . '/' . $file;
            header('Location: '.$newURL);
        }
    }
}
?>
