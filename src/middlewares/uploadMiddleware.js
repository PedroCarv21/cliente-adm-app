import multer from "multer";
import path from "path";

// Configuração de armazenamento em memória (para converter direto para BLOB)
const storage = multer.memoryStorage();

// Filtro de tipos de arquivo aceitos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipo de arquivo não suportado. Apenas JPEG, JPG, PNG e WEBP são permitidos."
      ),
      false
    );
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
  },
});

export default upload;
