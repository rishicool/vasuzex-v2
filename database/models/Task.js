import Model from 'vasuzex/Database/Model';

export class Task extends Model {
  static tableName = 'tasks';
  static primaryKey = 'id';
  static timestamps = true;
  static fillable = ['title', 'description', 'priority', 'status', 'due_date', 'completed_at'];
  static casts = {
    priority: 'int',
    due_date: 'datetime',
    completed_at: 'datetime'
  };
}
