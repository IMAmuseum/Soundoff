<?php
/**
 * @file
 * soundoff_features.features.inc
 */

/**
 * Implements hook_node_info().
 */
function soundoff_features_node_info() {
  $items = array(
    'sound' => array(
      'name' => t('Sound'),
      'base' => 'node_content',
      'description' => t('A Sound has a command, and one or more audio files'),
      'has_title' => '1',
      'title_label' => t('Title'),
      'help' => '',
    ),
  );
  return $items;
}
