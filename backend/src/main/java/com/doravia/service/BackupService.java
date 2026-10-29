package com.doravia.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupService.class);
    private static final String BACKUP_DIR = "data/backups";
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
    private static final int MAX_BACKUPS = 10;

    private final JdbcTemplate jdbcTemplate;

    public BackupService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @EventListener(ContextClosedEvent.class)
    public void onShutdown() {
        log.info("Shutdown detected — creating auto backup...");
        try {
            createBackup("auto");
        } catch (Exception e) {
            log.error("Failed to create shutdown backup", e);
        }
    }

    @Scheduled(cron = "0 0 */6 * * *")
    public void scheduledBackup() {
        log.info("Scheduled backup running...");
        try {
            createBackup("scheduled");
        } catch (Exception e) {
            log.error("Failed to create scheduled backup", e);
        }
    }

    public String createBackup(String tag) {
        ensureDir();
        String timestamp = LocalDateTime.now().format(FMT);
        String filename = String.format("doravia_%s_%s.db", tag, timestamp);
        String path = BACKUP_DIR + "/" + filename;

        jdbcTemplate.execute("VACUUM INTO '" + path + "'");

        log.info("Backup created: {}", filename);
        pruneOldBackups();
        return filename;
    }

    public List<Map<String, Object>> listBackups() {
        ensureDir();
        File dir = new File(BACKUP_DIR);
        File[] files = dir.listFiles((d, name) -> name.endsWith(".db"));
        if (files == null) return List.of();

        return Arrays.stream(files)
                .sorted(Comparator.comparingLong(File::lastModified).reversed())
                .map(f -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("filename", f.getName());
                    map.put("size", f.length());
                    map.put("modified", f.lastModified());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public File getBackupFile(String filename) {
        File file = new File(BACKUP_DIR, filename);
        if (!file.exists() || !file.isFile()) {
            throw new RuntimeException("Backup not found: " + filename);
        }
        if (!file.getAbsolutePath().startsWith(new File(BACKUP_DIR).getAbsolutePath())) {
            throw new RuntimeException("Invalid backup path");
        }
        return file;
    }

    private void pruneOldBackups() {
        File dir = new File(BACKUP_DIR);
        File[] files = dir.listFiles((d, name) -> name.endsWith(".db"));
        if (files == null || files.length <= MAX_BACKUPS) return;

        Arrays.sort(files, Comparator.comparingLong(File::lastModified));
        int toDelete = files.length - MAX_BACKUPS;
        for (int i = 0; i < toDelete; i++) {
            if (files[i].delete()) {
                log.info("Pruned old backup: {}", files[i].getName());
            }
        }
    }

    private void ensureDir() {
        File dir = new File(BACKUP_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }
}
