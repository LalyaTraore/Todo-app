import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { MatSidenavModule, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbarModule, MatToolbar } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule, MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class DashboardComponent implements OnInit {
title: any;
toggleDarkMode() {
throw new Error('Method not implemented.');
}
  /* ====================== MODALES ET NOTIFICATIONS ====================== */
  isDeleteModalVisible: boolean = false;
  isSaveNotificationVisible: boolean = false;
  taskToDelete: any = null;

  /* ====================== TÂCHES ====================== */
  tasks: any[] = [];
  newTask: any = { title: '', description: '', dueDate: '', project: null };
  filter: string = 'all';
  selectedTask: any = null;

  // Ajout fluide
  newTaskTitle: string = '';
  step: number = 1;

  /* ====================== UTILISATEURS (ADMIN) ====================== */
  users: any[] = [];
  showUsers = false;
  selectedUser: any = null;
  userTasks: any[] = [];
  selectedUserTask: any = null;

  /* ===================== SIDEBAR ===================== */
  isSidebarOpen: boolean = true;

  /* ===================== PROJETS ===================== */
  projects: string[] = [];
  newProject: string = '';
  filterProject: string | null = null;

  /* ===================== ASSIGNATION ===================== */
  showAssignDropdown: boolean = false;
  userSearch: string = '';

  /* ===================== UTILISATEUR ===================== */
  newUser = { username: '', password: '', role: 'USER' };
  showAddUser = false;
isDarkMode: any;
sidenav: any;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  /* ===================== INIT ===================== */
  ngOnInit(): void {
    this.loadTasks();
    if (this.role === 'ADMIN') {
      this.loadUsers();
    }
  }

  /* ===================== CHARGEMENT DES DONNÉES ===================== */
  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loadProjects();
      },
      error: (error) => {
        console.error('Erreur chargement tâches:', error);
        if (error.status === 403) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (data) => this.users = data,
      error: (error) => console.error('Erreur chargement utilisateurs:', error)
    });
  }

  /* ===================== SIDEBAR ===================== */
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /* ===================== ADMIN : GESTION UTILISATEURS ===================== */
  toggleUsers() {
    this.showUsers = !this.showUsers;
    if (this.showUsers) {
      this.loadUsers();
    }
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.selectedUserTask = null;
    this.adminService.getUserTasks(user.username).subscribe({
      next: (tasks) => this.userTasks = tasks,
      error: (error) => console.error('Erreur chargement tâches utilisateur:', error)
    });
  }

  selectUserTask(task: any) {
    this.selectedUserTask = task;
  }

  /* ===================== TÂCHES : CRUD ===================== */
  updateTask() {
    if (!this.selectedTask) return;
    
    this.taskService.updateTask(this.selectedTask.id, this.selectedTask).subscribe({
      next: () => {
        this.loadTasks();
        this.showSaveAlert(); // Affiche l'alerte de sauvegarde
      },
      error: (error) => {
        console.error('Erreur mise à jour tâche:', error);
        alert('Erreur lors de la sauvegarde');
      }
    });
  }

  // ✅ CORRIGÉ : Méthode pour sauvegarder avec alerte
  saveTask() {
    if (!this.selectedTask) return;
    
    this.taskService.updateTask(this.selectedTask.id, this.selectedTask).subscribe({
      next: () => {
        this.loadTasks();
        this.showSaveAlert();
      },
      error: (error) => {
        console.error('Erreur sauvegarde:', error);
        alert('❌ Erreur lors de la sauvegarde');
      }
    });
  }

  completeTask(id: number) {
    this.taskService.completeTask(id).subscribe({
      next: () => this.loadTasks(),
      error: (error) => console.error('Erreur complétion tâche:', error)
    });
  }

  // ✅ CORRIGÉ : Méthodes pour la modale de suppression
  openDeleteModal(task: any) {
    this.taskToDelete = task;
    this.isDeleteModalVisible = true;
  }

  closeDeleteModal() {
    this.isDeleteModalVisible = false;
    this.taskToDelete = null;
  }

  confirmDelete() {
    if (this.taskToDelete) {
      this.taskService.deleteTask(this.taskToDelete.id).subscribe({
        next: () => {
          this.selectedTask = null;
          this.loadTasks();
          this.closeDeleteModal();
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          this.closeDeleteModal();
        }
      });
    }
  }

  /* ===================== ALERTES ET NOTIFICATIONS ===================== */
  showSaveAlert() {
    this.isSaveNotificationVisible = true;
    setTimeout(() => {
      this.isSaveNotificationVisible = false;
    }, 3000);
  }

  // ✅ CORRIGÉ : Méthode closeTasks remplacée par closeTaskDetail
  closeTaskDetail() {
    this.selectedTask = null;
  }

  closeTasks() {
    this.selectedTask = null;
    this.selectedUser = null;
    this.selectedUserTask = null;
  }

  /* ===================== AUTH ===================== */
  get role(): string | null {
    return this.authService.getRole();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /* ===================== FILTRES TÂCHES ===================== */
  get filteredTasks() {
    const today = new Date().toISOString().split('T')[0];
    switch (this.filter) {
      case 'today':
        return this.tasks.filter(t => t.dueDate?.startsWith(today));
      case 'project':
        return this.tasks.filter(t => t.project === this.filterProject);
      case 'done':
        return this.tasks.filter(t => t.completed);
      case 'all':
      default:
        return this.tasks;
    }
  }

  // Compteurs
  get totalTasks(): number { return this.tasks.length; }
  
  get todayTasks(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.tasks.filter(t => t.dueDate?.startsWith(today)).length;
  }
  
  get doneTasks(): number {
    return this.tasks.filter(t => t.completed).length;
  }

  selectTask(task: any) {
    this.selectedTask = { ...task }; // Copie pour éviter la modification directe
  }

  /* ===================== AJOUT DE TÂCHE ===================== */
  addTaskStep1() {
    if (this.newTaskTitle.trim()) {
      this.newTask.title = this.newTaskTitle.trim();
      this.step = 2;
    }
  }

  confirmAddTask() {
    if (!this.newTask.dueDate) {
      this.newTask.dueDate = new Date().toISOString().split('T')[0];
    }
    if (this.filter === 'project' && this.filterProject) {
      this.newTask.project = this.filterProject;
    }

    this.taskService.createTask(this.newTask).subscribe({
      next: () => {
        this.newTask = { title: '', description: '', dueDate: '', project: null };
        this.newTaskTitle = '';
        this.step = 1;
        this.loadTasks();
        this.showSaveAlert();
      },
      error: (error) => console.error('Erreur création tâche:', error)
    });
  }

  /* ===================== GESTION UTILISATEURS ===================== */
  addUser() {
    if (!this.newUser.username.trim() || !this.newUser.password.trim()) return;
    
    this.adminService.createUser(this.newUser).subscribe({
      next: () => {
        this.newUser = { username: '', password: '', role: 'USER' };
        this.showAddUser = false;
        this.loadUsers();
        this.showSaveAlert();
      },
      error: (error) => console.error('Erreur création utilisateur:', error)
    });
  }

  get totalUsers(): number {
    return this.users.length;
  }

  /* ===================== PROJETS ===================== */
  loadProjects() {
    this.projects = [...new Set(this.tasks.map(t => t.project).filter(Boolean))];
  }

  filterByProject(p: string) {
    this.filterProject = p;
    this.showUsers = false;
    this.filter = 'project';
  }

  countTasksByProject(p: string): number {
    return this.tasks.filter(t => t.project === p).length;
  }

  addProject() {
    if (this.newProject.trim() && !this.projects.includes(this.newProject.trim())) {
      this.projects.push(this.newProject.trim());
      this.newProject = '';
      this.showSaveAlert();
    }
  }

  getProjectColor(project: string): string {
    const colors = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#6A4C93", "#1A535C"];
    let hash = 0;
    for (let i = 0; i < project.length; i++) {
      hash = project.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  /* ===================== ASSIGNATION UTILISATEURS ===================== */
  assignUser(username: string) {
    if (!username || !this.selectedTask) return;
    
    this.taskService.assignUser(this.selectedTask.id, username).subscribe({
      next: (task) => {
        this.selectedTask = task;
        this.showSaveAlert();
      },
      error: (error) => console.error('Erreur assignation:', error)
    });
  }

  assignUserToTask(taskId: number, username: string) {
    this.taskService.assignUser(taskId, username).subscribe({
      next: (updatedTask) => {
        this.selectedTask = updatedTask;
        this.loadTasks();
        this.showAssignDropdown = false;
        this.showSaveAlert();
      },
      error: (error) => console.error('Erreur assignation:', error)
    });
  }

  get filteredUsers() {
    if (!this.userSearch.trim()) return [];
    return this.users.filter(u =>
      u.username.toLowerCase().includes(this.userSearch.toLowerCase())
    );
  }

  removeUserFromTask(taskId: number, username: string) {
    this.taskService.removeUser(taskId, username).subscribe({
      next: (task) => {
        this.selectedTask = task;
        this.loadTasks();
        this.showSaveAlert();
      },
      error: (error) => console.error('Erreur retrait utilisateur:', error)
    });
  }
}