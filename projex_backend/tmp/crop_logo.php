<?php
$sourcePath = 'c:/xampp/htdocs/projex/projex_frontend/src/assets/PROJEX_icon.png';
$outputPath = 'c:/xampp/htdocs/projex/projex_frontend/public/favicon.png';

if (!file_exists($sourcePath)) {
    die("Source file not found\n");
}

$img = imagecreatefrompng($sourcePath);
if (!$img) {
    die("Failed to load PNG\n");
}

// Trouver les limites transparentes
$cropped = imagecropauto($img, IMG_CROP_TRANSPARENT);

if ($cropped !== false) {
    // Redimensionner en carré pour un favicon parfait (32x32 par exemple, ou garder le ratio)
    // Ici on garde le ratio mais on s'assure que c'est bien rogné
    imagepng($cropped, $outputPath);
    imagedestroy($cropped);
    echo "Image cropped successfully!\n";
} else {
    // Si l'auto-crop échoue, on copie le fichier original
    copy($sourcePath, $outputPath);
    echo "Auto-crop not possible, original copied.\n";
}

imagedestroy($img);
