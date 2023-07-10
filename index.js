const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer')
const path = require('path')
const cors = require('cors')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("./public"))
app.use(cors({
    origin:'*'
}))

var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({
    storage: storage
});

app.post('/api/movie',upload.single('foto'),(req, res) => {
    const data = { ...req.body };
    const id = Math.floor(Math.random() * 9999);
    const judul = req.body.judul;
    const foto = req.body.foto;
    const deskripsi = req.body.deskripsi;
    const terbit = req.body.terbit;
    const idMovie = Math.floor(Math.random() * 9999);

    if (!req.file) {
        console.log("No file upload");
        const querySql = 'INSERT INTO data (id,judul,deskripsi,terbit,idMovie) values (?,?,?,?,?);';
         
        koneksi.query(querySql,[ id,judul,deskripsi,terbit,idMovie], (err, rows, field) => {
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://localhost:5000/images/' + req.file.filename;
        const foto =   imgsrc;
        const data = { ...req.body };
        const querySql = 'INSERT INTO data (id,judul,foto,deskripsi,terbit,idMovie) values (?,?,?,?,?,?);';
 
        koneksi.query(querySql,[ id,judul,foto,deskripsi,terbit,idMovie], (err, rows, field) => {
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
            res.status(201).json({ success: true, message: 'Berhasil insert data!', id: id, idMovie: idMovie });
        });
    }
});

app.get('/api/movie', (req, res) => {
    const querySql = 'SELECT * FROM data';
    
    koneksi.query(querySql, (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }
        res.status(200).json({ success: true, data: rows });
    });
});

app.get('/api/getmovie', (req, res) => {
    const querySql = 'SELECT * FROM movie';
    
    koneksi.query(querySql, (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }
        res.status(200).json({ success: true, data: rows });
    });
});

app.put('/api/movie/:id', (req, res) => {
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM data WHERE id = ?';
    const id = req.body.id;
    const judul = req.body.judul;
    const deskripsi = req.body.deskripsi;
    const terbit = req.body.terbit;
    
    const queryUpdate = 'UPDATE data SET judul=?,deskripsi=?,terbit=? WHERE id = ?';

    koneksi.query(querySearch, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }
    
        if (rows.length) {
            koneksi.query(queryUpdate, [judul,deskripsi,terbit, req.params.id], (err, rows, field) => {
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

app.delete('/api/movie/:id', (req, res) => {
    const querySearch = 'SELECT * FROM data WHERE id = ?';
    const queryDelete = 'DELETE FROM data WHERE id = ?';

    koneksi.query(querySearch, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        if (rows.length) {
            koneksi.query(queryDelete, req.params.id, (err, rows, field) => {
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));