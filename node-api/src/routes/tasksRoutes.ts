import { Router, Request, Response } from "express";
import { TasksRepository } from "../repositories/tasksRepository";
import axios from "axios";

const router = Router();
const tasksRepository = new TasksRepository();
const langs = ["pt", "en", "es"];

// POST: Cria uma tarefa e solicita resumo ao serviço Python
router.post("/", async (req: Request, res: Response) => {
  try {
    const { text, lang } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Campo "text" é obrigatório.' });
    }
    if (!langs.includes(lang)) {
      return res.status(400).json({ error: "Language not supported" });
    }

    // Cria a "tarefa"
    const task = tasksRepository.createTask(text, lang);

    // zolicita o resumo do texto ao serviço llm python
    const response = await axios.post(`${process.env.PYTHON_LLM_URL}/summarize`, { text, lang });
    const summary = response.data.summary;
    console.log("response data:", response.data);

    // Atualiza a tarefa com o resumo
    tasksRepository.updateTask(task.id, summary);

    return res.status(201).json({
      message: "Tarefa criada com sucesso!",
      task: tasksRepository.getTaskById(task.id),
    });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return res
      .status(500)
      .json({ error: "Ocorreu um erro ao criar a tarefa." });
  }
});

// GET: Lista todas as tarefas
router.get("/", (req, res) => {
  const tasks = tasksRepository.getAllTasks();
  return res.json(tasks);
});

router.get("/:id", (req, res) => {
  const task = tasksRepository.getTaskById(Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: "Tarefa não encontrada." });
  }
  return res.json(task);
});

// DELETE: Remove uma tarefa pelo ID
router.delete("/:id", (req, res) => {
  const taskId = Number(req.params.id);
  const task = tasksRepository.getTaskById(taskId);
  if (!task) {
    return res.status(404).json({ error: "Tarefa não encontrada." });
  }
  if (tasksRepository.deleteTask(taskId)) {
    return res.status(200).json({ message: "Tarefa removida com sucesso." });
  }
  else {
    return res.status(500).json({ error: "Ocorreu um erro ao remover a tarefa." });
  }
  
});

export default router;
