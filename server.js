const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/todoDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const TaskSchema = new mongoose.Schema({
    titre: String,
    description: String,
    dateCreation: { type: Date, default: Date.now },
    echeance: Date,
    statut: { type: String, enum: ['à faire', 'en cours', 'terminée', 'annulée'] },
    priorite: { type: String, enum: ['basse', 'moyenne', 'haute', 'critique'] },
    auteur: {
        nom: String,
        prenom: String,
        email: String
    },
    categorie: String,
    etiquettes: [String],
    sousTaches: [{
        titre: String,
        statut: String,
        echeance: Date
    }],
    commentaires: [{
        auteur: String,
        date: { type: Date, default: Date.now },
        contenu: String
    }],
    historiqueModifications: [{
        champModifie: String,
        valeurAvant: String,
        valeurApres: String,
        dateModification: { type: Date, default: Date.now },
        auteur: String
    }]
});

const Task = mongoose.model('Task', TaskSchema);

// GET /tasks : récupérer toutes les tâches avec filtres et tri
app.get('/tasks', async (req, res) => {
    try {
        const { statut, priorite, categorie, etiquette, avant, apres, q, tri, ordre } = req.query;
        let filter = {};
        if (statut) filter.statut = statut;
        if (priorite) filter.priorite = priorite;
        if (categorie) filter.categorie = categorie;
        if (etiquette) filter.etiquettes = { $in: etiquette.split(',') };
        if (avant) filter.echeance = { ...filter.echeance, $lt: new Date(avant) };
        if (apres) filter.echeance = { ...filter.echeance, $gt: new Date(apres) };
        if (q) filter.$or = [
            { titre: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
        ];

        let tasks = Task.find(filter);
        if (tri) {
            const sortOrder = ordre === 'desc' ? -1 : 1;
            tasks = tasks.sort({ [tri]: sortOrder });
        }

        res.json(await tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /tasks/:id : récupérer une tâche par son ID
app.get('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /tasks : créer une nouvelle tâche
app.post('/tasks', async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT /tasks/:id : modifier une tâche existante
app.put('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });

        const modifications = [];
        const updatedFields = req.body;

        // Comparer les champs modifiés
        for (const key in updatedFields) {
            if (key === 'sousTaches') {
                // Comparer les sous-tâches
                const oldSousTaches = JSON.stringify(task.sousTaches || []);
                const newSousTaches = JSON.stringify(updatedFields.sousTaches || []);
                if (oldSousTaches !== newSousTaches) {
                    modifications.push({
                        champModifie: 'sousTaches',
                        valeurAvant: oldSousTaches,
                        valeurApres: newSousTaches,
                        dateModification: new Date(),
                    });
                }
            } else if (task[key] !== undefined && task[key] !== updatedFields[key]) {
                modifications.push({
                    champModifie: key,
                    valeurAvant: task[key],
                    valeurApres: updatedFields[key],
                    dateModification: new Date(),
                });
            }
        }

        // Ajouter les modifications à l'historique
        task.historiqueModifications.push(...modifications);

        // Mettre à jour la tâche
        Object.assign(task, updatedFields);
        await task.save();

        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /tasks/:id : supprimer une tâche
app.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });
        res.json({ message: 'Tâche supprimée' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /tasks/:id/commentaires : ajouter un commentaire à une tâche
app.post('/tasks/:id/commentaires', async (req, res) => {
    try {
        const { auteur, contenu } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });

        const commentaire = { auteur, contenu, date: new Date() };
        task.commentaires.push(commentaire);
        await task.save();

        res.status(201).json(commentaire);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(3000, () => console.log('Serveur démarré sur http://localhost:3000'));
