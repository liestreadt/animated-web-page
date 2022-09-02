const DB_NAME = 'GUESTBOOK';
const DB = {
  db: localStorage,
  records: [],
  /**
   * Получение всех записей
   * @returns {[]}
   */
  getAllRecords() {
    const records = this.db.getItem(`${DB_NAME}_records`);
    this.records = JSON.parse(records || '[]');
    return this.records;
  },
  /**
   * Сохранение всех записей
   */
  saveRecords() {
    this.db.setItem(`${DB_NAME}_records`, JSON.stringify(this.records));
  },
  /**
   * Добавление новой записи
   * @param record
   * @returns {[]}
   */
  addRecords(record) {
    this.records = [record, ...this.records];
    this.saveRecords();
    return this.records;
  },
  /**
   * Удаление записи
   * @param deleteId
   * @returns {[]}
   */
  deleteRecord(deleteId) {
    this.records = this.records.filter(({id}) => id !== deleteId);
    this.saveRecords();
    return this.records;
  },
  /**
   * Обновление записи
   * @param record
   * @returns {[]}
   */
  updateRecord(record) {
    this.records = this.records.map(c => c.id === record.id ? record : c);
    this.saveRecords();
    return this.records;
  }
};
