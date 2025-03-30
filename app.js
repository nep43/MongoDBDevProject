const API_URL = "http://localhost:3000/tasks";

// Fonction pour afficher les détails d'une tâche dans un popup
function afficherPopup(task) {
    document.getElementById("popup-title").innerText = task.titre;
    document.getElementById("popup-description").innerText = task.description;
    document.getElementById("popup-echeance").innerText = task.echeance;
    document.getElementById("popup-statut").innerText = task.statut;
    document.getElementById("popup-priorite").innerText = task.priorite;
    document.getElementById("popup-categorie").innerText = task.categorie;
    document.getElementById("popup-etiquettes").innerText = task.etiquettes.join(", ");
    document.getElementById("popup-auteur").innerText = `${task.auteur.nom} ${task.auteur.prenom}`;

    // Afficher les sous-tâches
    const sousTachesList = document.getElementById("popup-sousTaches");
    sousTachesList.innerHTML = ""; // Réinitialiser la liste
    task.sousTaches.forEach(sousTache => {
        const li = document.createElement("li");
        li.innerText = sousTache;
        sousTachesList.appendChild(li);
    });

    // Afficher le popup
    document.getElementById("popup").style.display = "block";
}

// Fonction pour fermer le popup
function fermerPopup() {
    document.getElementById("popup").style.display = "none";
}

// Fonction pour charger les tâches et les rendre cliquables
async function loadTasks() {
    const searchQuery = document.getElementById("search").value;
    const statusFilter = document.getElementById("filter-status").value;
    const priorityFilter = document.getElementById("filter-priority").value;
    const sortCriteria = document.getElementById("sort-criteria").value;
    const sortOrder = document.getElementById("sort-order").value;

    let url = `${API_URL}?q=${searchQuery}&statut=${statusFilter}&priorite=${priorityFilter}`;
    if (sortCriteria) {
        url += `&tri=${sortCriteria}`;
    }
    if (sortOrder) {
        url += `&ordre=${sortOrder}`;
    }

    const response = await fetch(url);
    const tasks = await response.json();

    const list = document.getElementById("task-list");
    list.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        // Rendre la tâche cliquable pour afficher la view popup
        li.onclick = () => afficherViewPopup(task._id);

        li.innerHTML = `
            <div class="task-header">
                <h3>${task.titre}</h3>
                <span class="task-priority priority-${task.priorite.toLowerCase()}">${task.priorite}</span>
            </div>
            <p>${task.description}</p>
            <div class="task-meta">
                <span class="task-category">${task.categorie}</span>
                <span class="task-date">${new Date(task.echeance).toLocaleDateString()}</span>
            </div>
            <div class="task-actions">
                <button class="btn-modify" onclick="event.stopPropagation(); afficherPopup('${task._id}')">Modifier</button>
                <button class="btn-delete" onclick="event.stopPropagation(); supprimerTache('${task._id}')">Supprimer</button>
            </div>
        `;

        list.appendChild(li);
    });
}

function ajouterSousTache() {
    const container = document.getElementById("sousTaches");
    const div = document.createElement("div");

    div.innerHTML = `
        <input type="text" placeholder="Titre de la sous-tâche">
        <select>
            <option value="à faire">À faire</option>
            <option value="en cours">En cours</option>
            <option value="terminée">Terminée</option>
        </select>
        <input type="date">
        <button onclick="this.parentNode.remove()">-</button>
    `;

    container.appendChild(div);
}

async function creerTache() {
    const tache = {
        titre: document.getElementById("titre").value,
        description: document.getElementById("description").value,
        echeance: document.getElementById("echeance").value,
        statut: document.getElementById("statut").value,
        priorite: document.getElementById("priorite").value,
        categorie: document.getElementById("categorie").value,
        etiquettes: document.getElementById("etiquettes").value.split(","),
        auteur: {
            nom: document.getElementById("nom").value,
            prenom: document.getElementById("prenom").value,
            email: document.getElementById("email").value
        },
        sousTaches: [...document.querySelectorAll("#sousTaches div")].map(div => ({
            titre: div.children[0].value,
            statut: div.children[1].value,
            echeance: div.children[2].value
        }))
    };

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tache)
    });

    loadTasks();
}

async function afficherPopup(id) {
    const response = await fetch(`${API_URL}/${id}`);
    const task = await response.json();

    document.getElementById("popup-title").value = task.titre || ""; // Valeur par défaut si vide
    document.getElementById("popup-description").value = task.description || ""; // Valeur par défaut si vide
    document.getElementById("popup-echeance").value = task.echeance ? task.echeance.split("T")[0] : ""; // Vérifie si `echeance` existe
    document.getElementById("popup-statut").value = task.statut || ""; // Valeur par défaut si vide
    document.getElementById("popup-priorite").value = task.priorite || ""; // Valeur par défaut si vide

    const sousTacheContainer = document.getElementById("popup-sousTaches");
    sousTacheContainer.innerHTML = "";

    if (task.sousTaches && task.sousTaches.length > 0) {
        task.sousTaches.forEach(st => {
            const div = document.createElement("div");
            div.innerHTML = `
                <input type="text" value="${st.titre || ""}" placeholder="Titre de la sous-tâche">
                <select>
                    <option value="à faire" ${st.statut === "à faire" ? "selected" : ""}>À faire</option>
                    <option value="en cours" ${st.statut === "en cours" ? "selected" : ""}>En cours</option>
                    <option value="terminée" ${st.statut === "terminée" ? "selected" : ""}>Terminée</option>
                </select>
                <input type="date" value="${st.echeance ? st.echeance.split("T")[0] : ""}">
            `;
            sousTacheContainer.appendChild(div);
        });
    }

    document.getElementById("popup").dataset.taskId = id; // Stocker l'ID de la tâche
    document.getElementById("popup").style.display = "block";
}

async function enregistrerModifications() {
    const id = document.getElementById("popup").dataset.taskId;

    const updatedTask = {
        titre: document.getElementById("popup-title").value,
        description: document.getElementById("popup-description").value,
        echeance: document.getElementById("popup-echeance").value,
        statut: document.getElementById("popup-statut").value,
        priorite: document.getElementById("popup-priorite").value,
        sousTaches: [...document.querySelectorAll("#popup-sousTaches div")].map(div => ({
            titre: div.children[0].value,
            statut: div.children[1].value,
            echeance: div.children[2].value
        }))
    };

    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask)
    });

    fermerPopup();
    loadTasks();
}

async function supprimerTache(id) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadTasks();
}

function fermerPopup() {
    document.getElementById("popup").style.display = "none";
}

window.onload = loadTasks;


// Fonction pour afficher les détails d'une tâche dans la nouvelle popup
async function afficherViewPopup(id) {
    const response = await fetch(`${API_URL}/${id}`);
    const task = await response.json();

    document.getElementById("view-popup-title").innerText = task.titre;
    document.getElementById("view-popup-description").innerText = task.description;
    document.getElementById("view-popup-echeance").innerText = task.echeance;
    document.getElementById("view-popup-statut").innerText = task.statut;
    document.getElementById("view-popup-priorite").innerText = task.priorite;
    document.getElementById("view-popup-categorie").innerText = task.categorie;
    document.getElementById("view-popup-etiquettes").innerText = task.etiquettes.join(", ");
    document.getElementById("view-popup-auteur").innerText = `${task.auteur.nom} ${task.auteur.prenom}`;

    // Afficher les sous-tâches avec leur état
    const sousTachesList = document.getElementById("view-popup-sousTaches");
    sousTachesList.innerHTML = ""; // Réinitialiser la liste
    task.sousTaches.forEach(sousTache => {
        const li = document.createElement("li");
        li.innerText = `${sousTache.titre} (${sousTache.statut})`; // Inclure l'état
        sousTachesList.appendChild(li);
    });

    // Afficher les commentaires
    const commentairesList = document.getElementById("view-popup-commentaires");
    commentairesList.innerHTML = ""; // Réinitialiser la liste
    task.commentaires.forEach(commentaire => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${commentaire.auteur}:</strong> ${commentaire.contenu}`;
        commentairesList.appendChild(li);
    });

    // Afficher la popup
    document.getElementById("view-popup").style.display = "block";

    // Stocker l'ID de la tâche pour ajouter des commentaires
    document.getElementById("view-popup").dataset.taskId = id;
}

async function ajouterCommentaire() {
    const taskId = document.getElementById("view-popup").dataset.taskId;
    const auteur = document.getElementById("new-comment-author").value;
    const contenu = document.getElementById("new-comment-content").value;

    if (!auteur || !contenu) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    const commentaire = { auteur, contenu };

    await fetch(`${API_URL}/${taskId}/commentaires`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentaire)
    });

    // Réinitialiser les champs et recharger les commentaires
    document.getElementById("new-comment-author").value = "";
    document.getElementById("new-comment-content").value = "";
    afficherViewPopup(taskId);
}

// Fonction pour fermer la nouvelle popup
function fermerViewPopup() {
    document.getElementById("view-popup").style.display = "none";
}
